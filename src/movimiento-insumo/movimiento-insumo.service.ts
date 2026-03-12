import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, MoreThan } from 'typeorm';
import { CreateMovimientoInsumoDto } from './dto/create-movimiento-insumo.dto';
import { MovimientoInsumo } from './entities/movimiento-insumo.entity';
import { TipoMovimiento } from 'src/insumos/enums/tipo-movimiento-insumo.enum';
import { InventarioInsumoService } from 'src/inventario-insumo/inventario-insumo.service';
import { InventarioInsumo } from '../inventario-insumo/entities/inventario-insumo.entity';
import { InventarioLote } from 'src/inventario-insumo/entities/inventario-lote.entity';
import { InventarioInsumoResponseDto } from './dto/movimiento-insumo.dto';

@Injectable()
export class MovimientoInsumoService { 

  constructor(

    private readonly inventarioInsumoService: InventarioInsumoService,

    private readonly DataSource: DataSource,

  ) {}

  // -> Registra un movimiento de insumo (ingreso, salida, merma o ajuste)
  async registrar(dto: CreateMovimientoInsumoDto, user_id: string, manager?: EntityManager) {

    if(!manager) {
      return this.DataSource.transaction(m => this.registrar(dto, user_id, m));
    }

    // 1 Calcular impacto
    const impacto = this.calcularImpacto(dto);

    return await this.DataSource.transaction(async manager => {
      
      // 2 Obtener inventario (valida insumo + existencia)
      const inventario = await this.obtenerInventarioTx(
        manager,
        dto,
        user_id,
      );

      // 1. INGRESO
      if( dto.tipo === TipoMovimiento.INGRESO ) {
      
        return await this.procesarIngreso(
          manager,
          inventario,
          impacto,
          dto,
          user_id,
        );
      }

      //* 2. SALIDA o MERMA (consumo de lotes FIFO similar, solo cambia tipo movimiento)
      
      else if (dto.tipo === TipoMovimiento.SALIDA || dto.tipo === TipoMovimiento.MERMA) {
        return await this.procesarEgreso(
          manager,
          inventario,
          impacto,
          dto,
          user_id,
        );
      }

      // !TODO: 4. AJUSTE

      else if (dto.tipo === TipoMovimiento.AJUSTE) {
        return await this.procesarAjuste(
          dto,
          user_id,
        ); 
      }

    });
    
  }

  // ** Métodos privados ** //
  private calcularImpacto(dto: CreateMovimientoInsumoDto): number {

    this.validarReglasPorTipo(dto);

    switch (dto.tipo) {
      case TipoMovimiento.INGRESO:
        return dto.cantidad;

      case TipoMovimiento.SALIDA:
      case TipoMovimiento.MERMA:
        return -dto.cantidad;

      case TipoMovimiento.AJUSTE:
        return dto.cantidad!;

      default:
        throw new BadRequestException('Tipo de movimiento inválido');
    }
  }

  private validarReglasPorTipo(dto: CreateMovimientoInsumoDto): void {

    if( dto.tipo === TipoMovimiento.INGRESO ){
      if( dto.costoUnitario === undefined || dto.costoUnitario <= 0 ) {
        throw new BadRequestException(
          'El costo unitario es obligatorio y debe ser mayor a 0 para movimientos de ingreso.'
        );
      }
    }

    else if (dto.tipo === TipoMovimiento.AJUSTE || dto.tipo === TipoMovimiento.MERMA) {

      if(dto.motivo === undefined || dto.motivo.trim() === '') {
        throw new BadRequestException(
          'El motivo es obligatorio para ajustes'
        );
      }

    }

  }

  // Retorna InventarioInsumo existente o nuevo (si es ingreso y no existía)
  private async obtenerInventarioTx(
    manager: EntityManager,
    dto: CreateMovimientoInsumoDto,
    user_id: string,
  ): Promise<InventarioInsumo> {

    let inventario = await manager.findOne(InventarioInsumo, {
      where: {
        insumo: { id: dto.insumo_id },
        user: { id: user_id },
      },
    });

    if (inventario) return inventario;

    if (dto.tipo !== TipoMovimiento.INGRESO) {
      throw new BadRequestException(
        'No existe inventario para este insumo, primero registra un ingreso.',
      );
    }

    inventario = manager.create(InventarioInsumo, {
      insumo: { id: dto.insumo_id },
      stockActual: 0,
      costoPromedio: 0,
      user: { id: user_id },
    });

    return await manager.save(inventario);
  }

  //* 1 Proceso de un ingreso de insumo
  private async procesarIngreso(
    manager: EntityManager,
    inventario: InventarioInsumo,
    impacto: number,
    dto: CreateMovimientoInsumoDto,
    user_id: string,
  ) : Promise<InventarioInsumoResponseDto> {

    // Obtener stock y costo actual para cálculos posteriores
    const stockAnterior = Number(inventario.stockActual) || 0;
    const costoAnterior = Number(inventario.costoPromedio) || 0;

    //* 1️⃣ Crear InventarioLote
    const lote = manager.create(InventarioLote, {
      inventario,
      cantidadInicial: impacto,
      cantidadDisponible: impacto,
      costoUnitario: dto.costoUnitario,
      user: { id: user_id },
    });

    // Guarda lote antes de actualizar InventarioInsumo
    await manager.save(lote);

    //* 2️⃣ Actualiza InventarioInsumo
    if (stockAnterior === 0) {
      inventario.stockActual = Number(impacto);
      inventario.costoPromedio = Number(dto.costoUnitario);
    } else {

      // Calculo de nuevo costo promedio ponderado
      const totalValor =
        Number(stockAnterior) * Number(costoAnterior) +
        Number(impacto) * Number(dto.costoUnitario!);

      inventario.stockActual = Number(stockAnterior) + Number(impacto);
      inventario.costoPromedio =
        Number(totalValor) / Number(inventario.stockActual);
    }

    //* Guarda inventarioInsumo actualizado
      await manager.save(inventario);

    //* 3️⃣ Crea movimientoInsumo
    const movimiento = manager.create(MovimientoInsumo, {
      insumo: { id: dto.insumo_id },
      tipo: dto.tipo,
      cantidad: impacto,
      costoUnitario: dto.costoUnitario,
      motivo: dto.motivo,
      user: { id: user_id },
      inventario: inventario
    });

    //* Guarda movimientoInsumo
    await manager.save(movimiento);

    return {
      stock_actual: inventario.stockActual,
      costo_promedio: inventario.costoPromedio!,
      motivo: dto.motivo,
      insumo_id: movimiento.insumo.id,
    };
  }

  //* 2 Procesa un egreso como salida o merma (consumo de lotes FIFO)
  private async procesarEgreso(
    manager: EntityManager,
    inventario: InventarioInsumo,
    impacto: number,
    dto: CreateMovimientoInsumoDto,
    user_id: string,
  ) : Promise<InventarioInsumoResponseDto> {

    const stockActual = Number(inventario.stockActual) || 0;

    if (stockActual + impacto < 0) {
      throw new BadRequestException('Stock insuficiente');
    }

    const costoUnitarioCalculado =
      await this.inventarioInsumoService.consumirLotesFIFO(
        manager,
        inventario,
        impacto,
        user_id,
      );

    inventario.stockActual = Number(stockActual) + Number(impacto);

    if (inventario.stockActual === 0) {
      inventario.costoPromedio = 0;
    }

    await manager.save(inventario);

    const movimiento = manager.create(MovimientoInsumo, {
      insumo: { id: dto.insumo_id },
      tipo: dto.tipo, // 🔥 aquí está la diferencia
      cantidad: Math.abs(impacto),
      costoUnitario: costoUnitarioCalculado,
      motivo: dto.motivo,
      user: { id: user_id },
      inventario: inventario
    });

    await manager.save(movimiento);

    return {
      stock_actual: inventario.stockActual,
      costo_promedio: inventario.costoPromedio!,
      motivo: dto.motivo,
      insumo_id: movimiento.insumo.id,
    };
  }

  //* 3 Procesa un ajuste (positivo o negativo) con lógica específica para cada caso
  async procesarAjuste(
    dto: CreateMovimientoInsumoDto,
    userId: string,
  ): Promise<InventarioInsumoResponseDto> {

    return await this.DataSource.transaction(async (manager) => {

      // Busca InventarioInsumo
      const inventario = await manager.findOne(InventarioInsumo, {
        where: {
          insumo: { id: dto.insumo_id },
          user: { id: userId },
        },
        relations: ['insumo'],
      });

      // si no hay arroja error
      if (!inventario) {
        throw new NotFoundException('Inventario no encontrado');
      }

      // Retorna el stick actual
      const stockActual = Number(inventario.stockActual);
      // Calcula el impacto (dto.cantidad == stock real deseado)
      const impacto = Number(dto.cantidad) - Number(stockActual);

      // costo promedio de inventario
      let costoUnitarioMovimiento = Number(inventario.costoPromedio);

      // Impacto 0 -> no hace nada
      if (impacto === 0) {
        throw new BadRequestException('No hay diferencia para ajustar');
      }

      // 🔵 AJUSTE POSITIVO → Crear lote nuevo
      if (impacto > 0) {

        const lote = manager.create(InventarioLote, {
          inventario,
          cantidadInicial: impacto,
          cantidadDisponible: impacto,
          costoUnitario: inventario.costoPromedio,
          user: { id: userId },
        });

        await manager.save(lote);

        inventario.stockActual = Number(dto.cantidad);

        // costoPromedio no cambia porque entra al mismo costo promedio

      }

      // 🔴 AJUSTE NEGATIVO → FIFO automático
      if (impacto < 0) {

        costoUnitarioMovimiento = await this.inventarioInsumoService.consumirLotesFIFO(
          manager,
          inventario,
          impacto,
          userId,
        );

        inventario.stockActual = Number(dto.cantidad);

        // costoPromedio no cambia en salidas
      }

      await manager.save(inventario);

       // 📌 Registrar movimiento
      const movimiento = manager.create(MovimientoInsumo, {
        tipo: dto.tipo,
        cantidad: Math.abs(impacto),
        costoUnitario: costoUnitarioMovimiento,
        motivo: dto.motivo,
        insumo: { id: dto.insumo_id },
        user: { id: userId },
        inventario,
      });

      await manager.save(movimiento);

      return {
        stock_actual: inventario.stockActual,
        costo_promedio: inventario.costoPromedio!,
        motivo: dto.motivo,
        insumo_id: movimiento.insumo.id,
      };

    });
  }









}
