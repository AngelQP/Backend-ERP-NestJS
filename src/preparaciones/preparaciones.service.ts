import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePreparacionDto } from './dto/create-preparacione.dto';
import { DataSource, In, Repository } from 'typeorm';
import { Postre } from 'src/postres/entities/postre.entity';
import { TipoMovimiento } from 'src/insumos/enums/tipo-movimiento-insumo.enum';
import { Preparacion } from './entities/preparacione.entity';
import { MovimientoInsumoService } from '../movimiento-insumo/movimiento-insumo.service';
import { UpdatePreparacionDto } from './dto/update-preparacione.dto';
import { EstadoPreparacion } from './interfaces/preparaciones.type';
import { DetallePreparacion } from './entities/detallePreparacion.entity';
import { FindPreparacionesDto } from './dto/include-anuladas.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindPreparacionesVentaDto } from './dto/include-ventas.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class PreparacionesService {

  constructor(
    private readonly dataSource: DataSource,

    private readonly movimientoInsumoService: MovimientoInsumoService,

    @InjectRepository(Preparacion)
    private readonly preparacionRepository: Repository<Preparacion>
  ) {}


  async create(dto: CreatePreparacionDto, userId: string) {

    return this.dataSource.transaction(async (manager) => {

      /**
       * 1️⃣ Validaciones
       */
      if (dto.porcionesPlanificadas <= 0) {
        throw new BadRequestException(
          'Las porciones planificadas deben ser mayor a 0',
        );
      }

      if (dto.porcionesReales <= 0) {
        throw new BadRequestException(
          'Las porciones reales deben ser mayor a 0',
        );
      }

      /**
       * 2️⃣ Buscar postre con receta
       */
      const postre = await manager.findOne(Postre, {
        where: { id: dto.postre_id, user: { id: userId }, activo: true },
        relations: [
          'receta', 
          'receta.insumo',
          'receta.insumo.inventario'
        ],
      });

      if (!postre) {
        throw new NotFoundException('Postre no encontrado');
      }

      /**
       * 3️⃣ Calcular factor de producción
       */
      const factor = Number(dto.porcionesPlanificadas) / Number(postre.rendimientoBase);

      /**
       * 4️⃣ Crear preparación
       */
      const preparacion = manager.create(Preparacion, {
        postre,
        porcionesPlanificadas: Number(dto.porcionesPlanificadas),
        porcionesReales: Number(dto.porcionesReales),
        porcionesDisponibles: Number(dto.porcionesReales),
        merma: 0,
        estado: EstadoPreparacion.ACTIVA,
        user: { id: userId },
      });

      const preparacionGuardada = await manager.save(preparacion);

      /**
       * 5️⃣ Procesar receta
       */

      const detalles: DetallePreparacion[] = [];

      for (const item of postre.receta) {

        const cantidadNecesaria =
          Math.abs(Number(item.cantidad) * factor);

        /**
         * 🔻 Registrar salida de inventario
         */

        await this.movimientoInsumoService.registrar(
          {
            tipo: TipoMovimiento.SALIDA,
            cantidad: Number(cantidadNecesaria),
            insumo_id: item.insumo.id,
            motivo: `Preparación de ${postre.nombrePostre}`
          },
          userId,
          manager,
        );

        /**
         * 🧾 Guardar detalle de preparación
         */
        const detalle = manager.create(DetallePreparacion, {

          preparacionId: preparacionGuardada.id,

          insumoId: item.insumo.id,

          cantidadUsada: Number(cantidadNecesaria),

          costoUnitario: Number(item.insumo.inventario.costoPromedio),

          subtotal:
            Number(cantidadNecesaria) *
            Number(item.insumo.inventario.costoPromedio),

        });

        detalles.push(detalle);
        // await manager.save(detalle);
      }

      await manager.save(DetallePreparacion, detalles);

      /**
       * 6️⃣ Calcular merma
       */
      const merma =
        Number(dto.porcionesPlanificadas) - Number(dto.porcionesReales);

      preparacionGuardada.merma = Number(merma);

      /**
       * 7️⃣ Guardar actualización
       */
      const preparacionMap = await manager.save(preparacionGuardada)
      
      return {
        id: preparacionMap.id,
        postre_id: postre.id,
        nombrePostre: postre.nombrePostre,
        precioVentaReferencia: postre.precioVentaReferencia,
        porcionesPlanificadas: preparacionMap.porcionesPlanificadas,
        porcionesReales: preparacionMap.porcionesReales,
        porcionesDisponibles: preparacionMap.porcionesDisponibles,
        merma: preparacionMap.merma,
        estado: preparacionMap.estado,
        fechaPreparacion: preparacionMap.fechaPreparacion,
      };

    });
  }

  async listarPreparacionesVentas(user_id: string, paginacion: FindPreparacionesVentaDto) {

    const page = paginacion.page ?? 1;
    const limit = paginacion.limit ?? 10;

    const skip = (page - 1) * limit;

    const qb = this.preparacionRepository
      .createQueryBuilder('prep')
      .leftJoin('prep.postre', 'postre')
      .select([
        'prep.id',
        'prep.porcionesPlanificadas',
        'prep.porcionesReales',
        'prep.porcionesDisponibles',
        'prep.estado',
        'prep.merma',
        'prep.fechaPreparacion',

        'postre.id',
        'postre.nombrePostre',
        'postre.precioVentaReferencia'
      ])
      .where('prep.user_id = :user_id', { user_id })
      .andWhere('prep.estado IN (:...estados)', {
        estados: [EstadoPreparacion.ACTIVA, EstadoPreparacion.EN_VENTA],
      });

    qb.orderBy('prep.fechaPreparacion', 'DESC');

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const dataTransformada = data.map((prep) => ({
      id: prep.id,
      nombrePostre: prep.postre.nombrePostre,
      // porcionesPlanificadas: prep.porcionesPlanificadas,
      porcionesReales: prep.porcionesReales,
      porcionesDisponibles: prep.porcionesDisponibles,
      precioVentaReferencia: prep.postre.precioVentaReferencia,
      merma: prep.merma,
      estado: prep.estado,
      fechaPreparacion: dayjs(prep.fechaPreparacion).tz('America/Lima').format('YYYY-MM-DD HH:mm:ss'),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: dataTransformada,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

  }

  async findAll(user_id: string, filtro: FindPreparacionesDto) {

    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 10;

    const skip = (page - 1) * limit;

    const qb = this.preparacionRepository
      .createQueryBuilder('prep')
      .leftJoin('prep.postre', 'postre')
      .select([
        'prep.id',
        'prep.porcionesPlanificadas',
        'prep.porcionesReales',
        'prep.porcionesDisponibles',
        'prep.estado',
        'prep.merma',
        'prep.fechaPreparacion',

        'postre.id',
        'postre.nombrePostre',
        'postre.precioVentaReferencia'
      ])
      .where('prep.user_id = :user_id', { user_id });

    /**
     * filtro por estado
     */
    if (filtro.estado) {
      const estados = Array.isArray(filtro.estado)
        ? filtro.estado
        : [filtro.estado];
      qb.andWhere('prep.estado IN (:...estados)', { estados });
    } else {
      qb.andWhere('prep.estado = :estado', {
        estado: EstadoPreparacion.ACTIVA,
      });
    }

    qb.orderBy('prep.fechaPreparacion', 'DESC');

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const dataTransformada = data.map((prep) => ({
      id: prep.id,
      postre_id: prep.postre.id,
      nombrePostre: prep.postre.nombrePostre,
      porcionesPlanificadas: prep.porcionesPlanificadas,
      porcionesReales: prep.porcionesReales,
      porcionesDisponibles: prep.porcionesDisponibles,
      precioVentaReferencia: prep.postre.precioVentaReferencia,
      merma: prep.merma,
      estado: prep.estado,
      fechaPreparacion: dayjs(prep.fechaPreparacion).tz('America/Lima').format('YYYY-MM-DD HH:mm:ss'),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: dataTransformada,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  findOne(id: string) {
    return `This action returns a #${id} preparacione`;
  }

  listarEstadosPreparacion(){
    return Object.values(EstadoPreparacion).map((estado) => ({
      value: estado,
      label: estado
    }));
  }

  remove(id: string, dto: UpdatePreparacionDto, user_id: string) {
    return this.dataSource.transaction(async (manager) => {

      /**
       * 1️⃣ Buscar preparación
       */
      const preparacion = await manager.findOne(Preparacion, {
        where: {
          id,
          user: { id: user_id },
        },
      });

      if (!preparacion) {
        throw new NotFoundException('Preparación no encontrada');
      }

      /**
       * 2️⃣ Validar transición de estado
       */
      if (dto.estado === EstadoPreparacion.ANULADA) {

        if (preparacion.estado === EstadoPreparacion.ANULADA) {
          throw new BadRequestException(
            'La preparación ya se encuentra anulada',
          );
        }

        if (preparacion.estado === EstadoPreparacion.FINALIZADA) {
          throw new BadRequestException(
            'No se puede anular una preparación finalizada',
          );
        }

        /**
         * 3️⃣ Buscar detalles de preparación
         */
        const detalles = await manager.find(DetallePreparacion, {
          select: ['insumoId', 'cantidadUsada', 'costoUnitario'],
          where: {
            preparacionId: preparacion.id,
          },
        });

        if (detalles.length === 0) {
          throw new BadRequestException(
            'No se encontraron detalles asociados a la preparación',
          );
        }

        /**
         * 4️⃣ Revertir inventario
         */
        for (const det of detalles) {

          await this.movimientoInsumoService.registrar(
            {
              tipo: TipoMovimiento.INGRESO,

              cantidad: det.cantidadUsada,

              insumo_id: det.insumoId,

              costoUnitario: det.costoUnitario,

              motivo: `Anulación preparación ${preparacion.id}`
            },
            user_id,
            manager,
          );
        }

        /**
         * 5️⃣ Cambiar estado
         */
        preparacion.estado = EstadoPreparacion.ANULADA;

        await manager.save(preparacion);

        return {
          message: 'Preparación anulada correctamente',
          preparacion_id: preparacion.id,
        };
      }

      throw new BadRequestException(
        'Transición de estado no permitida',
      );

    });
  }
}
