import { UnidadesInsumo } from "../enums/unidades-insumos.enum";

export class InsumoResponseDto {
    id: string;
    nombre: string;
    unidad: UnidadesInsumo;
}