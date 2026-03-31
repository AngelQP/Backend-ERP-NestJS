import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { User } from 'src/auth/entities/user.entity';
import { Preparacion } from 'src/preparaciones/entities/preparacione.entity';
import { EstadoPreparacion } from 'src/preparaciones/interfaces/preparaciones.type';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalleVenta.entity';
import { DataSource, Repository } from 'typeorm';
import { EstadoVenta } from './interfaces/estadoVenta.interface';
import { ListarVentasDto } from './dto/listar-ventas.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class VentasService {

  constructor(

    private readonly dataSource: DataSource,

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>

  ){}


  async crearVenta(dto: CreateDetalleVentaDto, user: User) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const { preparacion_id, cantidad, precioUnitario } = dto;

      
      // 1. Obtener preparación con lock
      const preparacion = await queryRunner.manager.findOne(Preparacion, {
        where: { id: preparacion_id },
        relations: ['user']
      });
      
      if (!preparacion) {
        throw new NotFoundException('Preparación no encontrada');
      }

      if (preparacion?.user.id !== user.id) {
        throw new ForbiddenException('No puedes vender esta preparación');
      }

      // 2. Validaciones de negocio
      if (preparacion.estado !== EstadoPreparacion.ACTIVA &&
          preparacion.estado !== EstadoPreparacion.EN_VENTA) {
        throw new BadRequestException('Preparación no disponible para venta');
      }

      if (preparacion.porcionesDisponibles < cantidad) {
        throw new BadRequestException('Stock insuficiente');
      }

      // 3. Calcular subtotal
      const subtotal = Number(cantidad) * Number(precioUnitario);

      // 4. Crear venta
      const venta = queryRunner.manager.create(Venta, {
        estado: EstadoVenta.PAGADA,
        total: subtotal,
        user,
      });

      await queryRunner.manager.save(venta);

      // 5. Crear detalle
      const detalle = queryRunner.manager.create(DetalleVenta, {
        venta,
        preparacion,
        // preparacion_id,
        cantidad,
        precioUnitario,
        subtotal,
      });

      await queryRunner.manager.save(detalle);

      // 6. Actualizar preparación (DESCUENTO)
      preparacion.porcionesDisponibles -= cantidad;

      // 7. Cambiar estado
      if (preparacion.porcionesDisponibles === 0) {
        preparacion.estado = EstadoPreparacion.FINALIZADA;
      } else {
        preparacion.estado = EstadoPreparacion.EN_VENTA;
      }

      await queryRunner.manager.save(preparacion);

      // 8. Commit
      await queryRunner.commitTransaction();

      return {
        "id": venta.id,
        "estado": venta.estado,
        "total": venta.total,
        "fechaVenta": venta.fechaVenta,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listarVentas(
    user: User,
    query: ListarVentasDto
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const estados = query.estado?.length
      ? query.estado
      : [EstadoVenta.PAGADA];

    const [ventas, total] = await this.ventaRepository
      .createQueryBuilder('venta')
      
      .leftJoinAndSelect('venta.detalle', 'detalle')
      .leftJoinAndSelect('detalle.preparacion', 'preparacion')
      .leftJoinAndSelect('preparacion.postre', 'postre')

      .where('venta.user.id = :userId', {
        userId: user.id
      })

      .andWhere('venta.estado IN (:...estados)', {
        estados
      })

      .orderBy('venta.fechaVenta', 'DESC')

      .skip((page - 1) * limit)
      .take(limit)

      .getManyAndCount();

    const data = ventas.map((venta) => {

      if (!venta.detalle) return null;

      if (!venta.detalle.preparacion) return null;

      if (!venta.detalle.preparacion.postre) return null;

      return {
        id: venta.id,
        nombrePostre: venta.detalle.preparacion.postre.nombrePostre,
        fechaVenta: dayjs(venta.fechaVenta)
          .tz('America/Lima')
          .format('YYYY-MM-DD HH:mm:ss'),
        estado: venta.estado,
        cantidad: venta.detalle.cantidad,
        precioUnitario: venta.detalle.precioUnitario,
        total: venta.total
      };
    }).filter(Boolean);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} venta`;
  // }

  // update(id: number, updateVentaDto: UpdateVentaDto) {
  //   return `This action updates a #${id} venta`;
  // }

  async anularVenta(ventaId: string, user: User) {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      // 1. Buscar venta
      const venta = await queryRunner.manager.findOne(Venta, {
        where: { id: ventaId },
        relations: [
          'user',
          'detalle',
          'detalle.preparacion'
        ]
      });

      if (!venta) {
        throw new NotFoundException('Venta no encontrada');
      }

      // 2. Validar dueño
      if (venta.user.id !== user.id) {
        throw new ForbiddenException('No puedes anular esta venta');
      }

      // 3. Validar estado
      if (venta.estado === EstadoVenta.ANULADA) {
        throw new BadRequestException('La venta ya está anulada');
      }

      // 4. Validar tiempo (máximo 24 horas)
      const fechaVenta = new Date(venta.fechaVenta);
      const fechaActual = new Date();

      const diferenciaMs = fechaActual.getTime() - fechaVenta.getTime();
      const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

      if (diferenciaHoras > 24) {
        throw new BadRequestException(
          'La venta solo puede anularse dentro de las primeras 24 horas'
        );
      }

      const detalle = venta.detalle;

      if (!detalle) {
        throw new BadRequestException('Detalle de venta no encontrado');
      }

      const preparacion = detalle.preparacion;

      if (!preparacion) {
        throw new BadRequestException('Preparación no encontrada');
      }

      // 5. Preparación no debe estar anulada
      if (preparacion.estado === EstadoPreparacion.ANULADA) {
        throw new BadRequestException(
          'No se puede anular la venta porque la preparación está anulada'
        );
      }

      // 6. Reponer stock
      preparacion.porcionesDisponibles += detalle.cantidad;

      if (preparacion.porcionesDisponibles > preparacion.porcionesReales) {
        throw new BadRequestException(
          'El stock no puede superar las porciones reales'
        );
      }

      // 7. Recalcular estado de preparación
      if (preparacion.porcionesDisponibles === preparacion.porcionesReales) {

        preparacion.estado = EstadoPreparacion.ACTIVA;

      } else {

        preparacion.estado = EstadoPreparacion.EN_VENTA;
      }

      await queryRunner.manager.save(preparacion);

      // 8. Anular venta
      venta.estado = EstadoVenta.ANULADA;

      await queryRunner.manager.save(venta);

      // 9. Commit
      await queryRunner.commitTransaction();

      return {
        message: 'Venta anulada correctamente',
        ventaId: venta.id,
        stockRestituido: detalle.cantidad,
        stockActual: preparacion.porcionesDisponibles,
        estadoPreparacion: preparacion.estado
      };

    } catch (error) {

      await queryRunner.rollbackTransaction();
      throw error;

    } finally {

      await queryRunner.release();
    }
  }
}
