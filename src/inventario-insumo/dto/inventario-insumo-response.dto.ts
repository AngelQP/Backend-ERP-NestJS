import { UnidadesInsumo } from 'src/insumos/enums/unidades-insumos.enum';

export class InventarioInsumoResponseDto {
  insumo_id: string;
  nombre: string;
  unidad: UnidadesInsumo;
  stockActual: number;
  costoUnitario: number;
}