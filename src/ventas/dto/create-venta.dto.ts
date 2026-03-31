import { IsUUID, IsInt, Min, IsNumber } from 'class-validator';

export class CreateDetalleVentaDto {

  @IsUUID()
  preparacion_id: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
}

export class CreateVentaDto {

  detalle: CreateDetalleVentaDto;

}