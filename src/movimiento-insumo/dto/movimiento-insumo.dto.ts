import { TipoMovimiento } from "src/insumos/enums/tipo-movimiento-insumo.enum";

export class CreateIngresoInsumoDto {
  insumo_id: string;
  lote: string;
  fechaVencimiento?: Date;
  cantidad: number;
  costoUnitario: number;
}

export class CreateSalidaInsumoDto {
  insumo_id: string;
  inventario_id: string;
  cantidad: number;
  motivo?: string;
}

export class InventarioInsumoResponseDto {
  stock_actual: number;
  costo_promedio: number;
  motivo?: string;
  insumo_id: string;
}
