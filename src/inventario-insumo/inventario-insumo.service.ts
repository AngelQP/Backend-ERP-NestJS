import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, MoreThan, Repository } from 'typeorm';
import { InventarioInsumo } from './entities/inventario-insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { InventarioInsumoResponseDto } from './dto/inventario-insumo-response.dto';
import { InventarioLote } from './entities/inventario-lote.entity';

@Injectable()
export class InventarioInsumoService {

  constructor(

    // private readonly dataSource: DataSource,

    @InjectRepository(InventarioInsumo)
    private readonly inventarioRepo: Repository<InventarioInsumo>,

    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,
  ) {}

  // listado de insumos con su stock actual y costo promedio
  async listar(userId: string): Promise<InventarioInsumoResponseDto[]> {
    const insumos = await this.insumoRepo.find({
      where: { user: { id: userId } },
      relations: ['inventario'], // asegúrate que la relación exista
      order: { nombre: 'ASC' },
    });

    return insumos.map(insumo => {

      const inventario = insumo.inventario;

      return {
        insumo_id: insumo.id,
        nombre: insumo.nombre,
        unidad: insumo.unidad,
        stockActual: inventario ? Number(inventario.stockActual) : 0,
        costoUnitario: inventario ? Number(inventario.costoPromedio) : 0,
      };

    });
  }

  // Crea inventario inicial al registrar el primero ingreso de un insumo. Si ya existe, no hace nada.
  async crearInventarioParaIngreso(insumoId: string, userId: string): Promise<InventarioInsumo> {

    const inventario = this.inventarioRepo.create({
      insumo: {id: insumoId} as Insumo,
      stockActual: 0,
      costoPromedio: 0,
      user: { id: userId },
    });

    return await this.inventarioRepo.save(inventario);

  }

  async buscarPorInsumo(insumoId: string, userId: string) : Promise<InventarioInsumo | null> {
    const inventario = await this.inventarioRepo.findOne({
      where: { 
        insumo: { id: insumoId },
        user: { id: userId },
      },
    });
    return inventario;
  }

  // metodo para consumir lotes mediante FIFO -> usado por merma y salida
  async consumirLotesFIFO(
    manager: EntityManager,
    inventario: InventarioInsumo,
    impacto: number,
    user_id: string,
  ): Promise<number> {

    let restante = Math.abs(impacto);
    let costoTotalConsumido = 0;

    const lotes = await manager.find(InventarioLote, {
      where: {
        inventario: { id: inventario.id },
        user: { id: user_id },
        cantidadDisponible: MoreThan(0),
      },
      order: { fechaIngreso: 'ASC' },
    });

    for (const lote of lotes) {
      if (restante <= 0) break;

      const disponible = Number(lote.cantidadDisponible);
      const costoLote = Number(lote.costoUnitario);

      if (disponible <= restante) {
        costoTotalConsumido += disponible * costoLote;
        restante -= disponible;
        lote.cantidadDisponible = 0;
      } else {
        costoTotalConsumido += restante * costoLote;
        lote.cantidadDisponible = disponible - restante;
        restante = 0;
      }

      await manager.save(lote);
    }

    if (restante > 0) {
      throw new BadRequestException('Stock inconsistente');
    }

    const cantidadConsumida = Math.abs(impacto);

    return costoTotalConsumido / cantidadConsumida;
  }
  





}
