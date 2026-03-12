import { IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPreparacion } from '../interfaces/preparaciones.type';

export class FindPreparacionesDto {

  @IsOptional()
  @IsEnum(EstadoPreparacion, {each: true})
  estado?: EstadoPreparacion[];

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