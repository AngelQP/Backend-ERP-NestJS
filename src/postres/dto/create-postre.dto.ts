import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecetaDetalleDto {
  @IsUUID('4',{
    message: 'El insumo_id debe ser un UUID válido',
  })
  insumo_id: string;

  @IsNumber()
  @Min(0)
  cantidad: number;
}

export class CreatePostreDto {
  @IsString()
  nombrePostre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsPositive({
    message: 'El precio de venta debe ser un número positivo',
  })
  precioVentaReferencia: number;

  @IsNumber()
  @Min(1)
  rendimientoBase: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaDetalleDto)
  receta: RecetaDetalleDto[];
}