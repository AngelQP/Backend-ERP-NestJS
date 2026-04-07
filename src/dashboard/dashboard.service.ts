import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Venta } from 'src/ventas/entities/venta.entity';
import { EstadoVenta } from 'src/ventas/interfaces/estadoVenta.interface';

import { MovimientoInsumo } from 'src/movimiento-insumo/entities/movimiento-insumo.entity';
import { TipoMovimiento } from 'src/insumos/enums/tipo-movimiento-insumo.enum';

import { InventarioInsumo } from 'src/inventario-insumo/entities/inventario-insumo.entity';

import { Postre } from 'src/postres/entities/postre.entity';

import { getTodayRange, getMonthRange, getWeekRange } from './helper/date-range.helper';

import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { User } from 'src/auth/entities/user.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/Lima';

@Injectable()
export class DashboardService {

  constructor(

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(MovimientoInsumo)
    private readonly movimientoRepository: Repository<MovimientoInsumo>,

    @InjectRepository(InventarioInsumo)
    private readonly inventarioRepository: Repository<InventarioInsumo>,

    @InjectRepository(Postre)
    private readonly postreRepository: Repository<Postre>,

  ) {}

  // ===============================
  // STATS
  // ===============================

  async getStats(user: User) {

    const { start: startMonth, end: endMonth } = getMonthRange();
    const { start: startWeek, end: endWeek } = getWeekRange();

    // ingresos del mes
    const ingresosMes = await this.ventaRepository
      .createQueryBuilder('venta')
      .select('COALESCE(SUM(venta.total),0)', 'total')
      .where('venta.user_id = :user', { user: user.id })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.PAGADA })
      .andWhere('venta.fechaVenta BETWEEN :start AND :end', {
        start: startMonth,
        end: endMonth,
      })
      .getRawOne();

    // gastos del mes
    const gastosMes = await this.movimientoRepository
      .createQueryBuilder('mov')
      .select('COALESCE(SUM(mov.cantidad * mov.costoUnitario),0)', 'total')
      .where('mov.user_id = :user', { user: user.id })
      .andWhere('mov.tipo = :tipo', { tipo: TipoMovimiento.INGRESO })
      .andWhere('mov.fecha BETWEEN :start AND :end', {
        start: startMonth,
        end: endMonth,
      })
      .getRawOne();

    // ventas del mes
    const ventasMes = await this.ventaRepository
      .createQueryBuilder('venta')
      .where('venta.user_id = :user', { user: user.id })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.PAGADA })
      .andWhere('venta.fechaVenta BETWEEN :start AND :end', {
        start: startMonth,
        end: endMonth,
      })
      .getCount();

    // ventas semana
    const ventasSemana = await this.ventaRepository
      .createQueryBuilder('venta')
      .where('venta.user_id = :user', { user: user.id })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.PAGADA })
      .andWhere('venta.fechaVenta BETWEEN :start AND :end', {
        start: startWeek,
        end: endWeek,
      })
      .getCount();

    const ingresos = Number(ingresosMes.total);
    const gastos = Number(gastosMes.total);

    return {
      ingresosMes: ingresos,
      gastosMes: gastos,
      balance: ingresos - gastos,
      ventasMes,
      ventasSemana,
    };
  }

  // ===============================
  // CHARTS
  // ===============================

  async getIncomeVsExpensesChart(user: User) {

    const year = dayjs().tz(TZ).year();

    // ventas agrupadas por mes
    const ventas = await this.ventaRepository
      .createQueryBuilder('venta')
      .select("EXTRACT(MONTH FROM venta.fechaVenta)", 'mes')
      .addSelect('SUM(venta.total)', 'total')
      .where('venta.user_id = :user', { user: user.id })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.PAGADA })
      .andWhere("EXTRACT(YEAR FROM venta.fechaVenta) = :year", { year })
      .groupBy('mes')
      .orderBy('mes', 'ASC')
      .getRawMany();

    // gastos agrupados por mes
    const gastos = await this.movimientoRepository
      .createQueryBuilder('mov')
      .select("EXTRACT(MONTH FROM mov.fecha)", 'mes')
      .addSelect('SUM(mov.cantidad * mov.costoUnitario)', 'total')
      .where('mov.user_id = :user', { user: user.id })
      .andWhere('mov.tipo = :tipo', { tipo: TipoMovimiento.INGRESO })
      .andWhere("EXTRACT(YEAR FROM mov.fecha) = :year", { year })
      .groupBy('mes')
      .orderBy('mes', 'ASC')
      .getRawMany();

    const months = [
      'Ene','Feb','Mar','Abr','May','Jun',
      'Jul','Ago','Sep','Oct','Nov','Dic'
    ];

    const result: {
      name: string;
      ventas: number;
      gastos: number;
    }[] = [];

    const currentMonth = dayjs().tz(TZ).month() + 1;

    for (let i = 1; i <= currentMonth; i++) {

      const ventaMes = ventas.find(v => Number(v.mes) === i);
      const gastoMes = gastos.find(g => Number(g.mes) === i);

      result.push({
        name: months[i - 1],
        ventas: ventaMes ? Number(ventaMes.total) : 0,
        gastos: gastoMes ? Number(gastoMes.total) : 0,
      });
    }

    return result;
  }

  // ===============================
  // TOP PRODUCTS
  // ===============================

  async getTopProducts(user: User) {

    const result = await this.ventaRepository
      .createQueryBuilder('venta')
      .innerJoin('venta.detalle', 'detalle')
      .innerJoin('detalle.preparacion', 'prep')
      .innerJoin('prep.postre', 'postre')
      .select('postre.nombrePostre', 'name')
      .addSelect('SUM(detalle.cantidad)', 'ventas')
      .where('venta.user_id = :user', { user: user.id })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.PAGADA })
      .groupBy('postre.nombrePostre')
      .orderBy('ventas', 'DESC')
      .limit(5)
      .getRawMany();

    return result.map(r => ({
      name: r.name,
      ventas: Number(r.ventas),
    }));
  }

  // ===============================
  // RECENT SALES
  // ===============================

  async getRecentSales(user: User) {

    const ventas = await this.ventaRepository
      .createQueryBuilder('venta')
      .innerJoinAndSelect('venta.detalle', 'detalle')
      .innerJoinAndSelect('detalle.preparacion', 'prep')
      .innerJoinAndSelect('prep.postre', 'postre')
      .where('venta.user_id = :user', { user: user.id })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.PAGADA })
      .orderBy('venta.fechaVenta', 'DESC')
      .limit(5)
      .getMany();

    return ventas.map(v => ({

      id: v.id,
      product: v.detalle.preparacion.postre.nombrePostre,
      quantity: v.detalle.cantidad,
      total: Number(v.total),
      time: this.getTimeAgo(v.fechaVenta),

    }));
  }

  // ===============================
  // INVENTORY
  // ===============================

  async getInventoryStats(user: User) {

    const { start, end } = getTodayRange();

    // insumos disponibles
    const insumosDisponibles = await this.inventarioRepository
      .createQueryBuilder('inv')
      .innerJoin('inv.insumo', 'insumo')
      .where('inv.user_id = :user', { user: user.id })
      .andWhere('inv.stockActual > 0')
      .andWhere('insumo.activo = true')
      .getCount();

    // stock bajo
    const stockBajo = await this.inventarioRepository
      .createQueryBuilder('inv')
      .innerJoin('inv.insumo', 'insumo')
      .where('inv.user_id = :user', { user: user.id })
      .andWhere(`
        (insumo.unidad = 'UNIDAD' AND inv.stockActual <= 10) OR
        (insumo.unidad = 'KG' AND inv.stockActual <= 5) OR
        (insumo.unidad = 'L' AND inv.stockActual <= 5) OR
        (insumo.unidad = 'ML' AND inv.stockActual <= 250) OR
        (insumo.unidad = 'GR' AND inv.stockActual <= 250)
      `)
      .getCount();

    // postres activos
    const postresActivos = await this.postreRepository
      .createQueryBuilder('postre')
      .where('postre.user_id = :user', { user: user.id })
      .andWhere('postre.activo = true')
      .andWhere('postre.deletedAt IS NULL')
      .getCount();

    // ventas hoy
    const ventasHoy = await this.ventaRepository
      .createQueryBuilder('venta')
      .where('venta.user_id = :user', { user: user.id })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.PAGADA })
      .andWhere('venta.fechaVenta BETWEEN :start AND :end', {
        start,
        end,
      })
      .getCount();

    return {
      insumosDisponibles,
      stockBajo,
      postresActivos,
      ventasHoy,
    };
  }

  // ===============================
  // HELPER
  // ===============================

  private getTimeAgo(date: Date): string {

    const now = dayjs().tz(TZ);
    const saleDate = dayjs(date).tz(TZ);

    const hours = now.diff(saleDate, 'hour');

    if (hours < 1) return 'Hace unos minutos';

    if (hours < 24) return `Hace ${hours}h`;

    const days = now.diff(saleDate, 'day');

    if (days === 1) return 'Ayer';

    return saleDate.format('DD/MM/YYYY');
  }

}