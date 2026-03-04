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
  @IsUUID(4,{
    message: 'El insumo_id debe ser un UUID válido',
  })
  insumo_id: string;

  @IsPositive({
    message: 'La cantidad debe ser un número positivo',
  })
  cantidad: number;
}

export class UpdatePostreDto {
  // @IsUUID()
  // id: string;

  @IsString()
  nombrePostre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsPositive()
  precioVentaReferencia: number;

  @IsNumber()
  @Min(1)
  rendimientoBase: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaDetalleDto)
  receta: RecetaDetalleDto[];
}