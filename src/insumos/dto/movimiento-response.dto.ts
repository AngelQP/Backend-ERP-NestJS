import { TipoMovimiento } from "../enums/tipo-movimiento-insumo.enum"


export class MovimientoResponseDto {

    id: string;
    tipo:  TipoMovimiento;
    cantidad: number;
    costoUnitario: number;
    fecha: Date;
    motivo?: string | null;
    
}