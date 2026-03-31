import { IsEnum, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoVenta } from '../interfaces/estadoVenta.interface';

export class ListarVentasDto {
  
  @IsOptional()
  @IsArray()
  @IsEnum(EstadoVenta, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : [value]
  )
  estado?: EstadoVenta[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}