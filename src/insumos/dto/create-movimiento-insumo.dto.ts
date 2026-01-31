import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from "class-validator";
import { TipoMovimiento } from "../enums/tipo-movimiento-insumo.enum";


export class CreateMovimientoInsumoDto {

    @IsUUID()
    insumo_id: string;

    @IsEnum(TipoMovimiento)
    tipo: TipoMovimiento;

    @IsInt()
    @Min(-10000)
    cantidad: number;
    
    @IsNumber()
    @IsPositive()
    costoUnitario: number;

    @IsOptional()
    @IsString()
    motivo?: string;
}