import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecetaDetalleDto {
  @IsUUID()
  insumoId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;
}

export class UpdatePostreDto {
  @IsUUID()
  id: string;

  @IsString()
  nombrePostre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  precioReferencia: number;

  @IsNumber()
  @Min(1)
  rendimientoBase: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaDetalleDto)
  receta: RecetaDetalleDto[];
}