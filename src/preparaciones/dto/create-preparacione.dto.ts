import { IsUUID, IsInt, Min } from 'class-validator';

export class CreatePreparacionDto {

  @IsUUID(4, {
    message: 'El UUID no es válido',
  })
  postre_id: string;

  @IsInt({
    message: 'Las porciones planificadas deben ser un número entero',
  })
  @Min(1, {
    message: 'Las porciones planificadas deben ser al menos 1',
  })
  porcionesPlanificadas: number;

  @IsInt({
    message: 'Las porciones reales deben ser un número entero',
  })
  @Min(1, {
    message: 'Las porciones reales deben ser al menos 1',
  })
  porcionesReales: number;
}