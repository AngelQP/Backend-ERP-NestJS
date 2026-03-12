import { IsEnum, IsInt, IsOptional, IsUUID, Min, ValidateIf } from "class-validator";
import { TipoMovimiento } from "src/insumos/enums/tipo-movimiento-insumo.enum";

export class CreateMovimientoInsumoDto {

  @IsUUID()
  insumo_id: string;

  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @IsInt({
    message: 'La cantidad debe ser un número entero',
  })
  @Min(1, {
    message: 'La cantidad debe ser mayor a 0',
  })
  cantidad: number;

  @Min(0, { message: 'El costo unitario debe ser un número positivo'})
  @IsOptional()
  costoUnitario?: number;

  @IsOptional()
  motivo?: string;
}
