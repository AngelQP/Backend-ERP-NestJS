import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarInsumosDto {

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  search?: string;

}