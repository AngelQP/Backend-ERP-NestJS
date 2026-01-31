import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovimientoInsumoDto } from './dto/create-movimiento-insumo.dto';
import { TipoMovimiento } from './enums/tipo-movimiento-insumo.enum';
import { Insumo } from './entities/insumo.entity';
import { MovimientoInsumo } from './entities/movimientoInsumo.entity';
import { MovimientoResponseDto } from './dto/movimiento-response.dto';

@Injectable()
export class MovimientoInsumoService { 

  constructor(

    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,

    @InjectRepository(MovimientoInsumo)
    private readonly movimientoInsumoRepository: Repository<MovimientoInsumo>,

  ) {}

  async registrar(dto: CreateMovimientoInsumoDto, user_id: string) : Promise<MovimientoResponseDto> {

    const insumoQuery = await this.insumoRepository.findOneBy({ id: dto.insumo_id });

    if (!insumoQuery) {
      throw new NotFoundException('Insumo no existe');
    }

    const stockActual = await this.obtenerStockActual(dto.insumo_id);

    const impacto = this.calcularImpacto(dto.tipo, dto.cantidad);

    if (stockActual + impacto < 0) {
      throw new BadRequestException('Stock insuficiente');
    }

    const movimiento = this.movimientoInsumoRepository.create({
      insumo: { id: dto.insumo_id },
      ...dto,
      cantidad: impacto,
      user: { id: user_id },
    });

    const {insumo, user, ...safeData} = await this.movimientoInsumoRepository.save(movimiento);
    
    const response = new MovimientoResponseDto();

    Object.assign(response, safeData);

    return response;
  }

  // ** Métodos privados ** //
  private calcularImpacto(
    tipo: TipoMovimiento,
    cantidad: number
  ): number {
    switch (tipo) {
      case TipoMovimiento.INGRESO:
        return Math.abs(cantidad);

      case TipoMovimiento.SALIDA:
        return -Math.abs(cantidad);

      case TipoMovimiento.AJUSTE:
        return cantidad;

      default:
        throw new Error('Tipo de movimiento no válido');
    }
  }

  private async obtenerStockActual(insumo_id: string): Promise<number> {
    const result = await this.movimientoInsumoRepository
      .createQueryBuilder('m')
      .select('COALESCE(SUM(m.cantidad), 0)', 'stock')
      .where('m.insumo_id = :insumo_id', { insumo_id})
      .getRawOne();

    return Number(result.stock);
  }



}
