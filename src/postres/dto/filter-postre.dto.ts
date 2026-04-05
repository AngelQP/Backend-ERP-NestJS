import { IsOptional, IsNumberString } from 'class-validator';

export class FilterPostresDto {

  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;

}