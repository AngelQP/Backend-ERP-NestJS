
import { IsEnum } from 'class-validator';
import { EstadoPreparacion } from '../interfaces/preparaciones.type';

export class UpdatePreparacionDto {

  @IsEnum(EstadoPreparacion,{
    message: 'Estado de preparación inválido'
  })
  estado: EstadoPreparacion;

}