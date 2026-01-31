import { IsEnum, IsOptional, IsString } from "class-validator";
import { UnidadesInsumo } from "../enums/unidades-insumos.enum";

export class UpdateInsumoDto {

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsEnum(UnidadesInsumo)
    unidad?: UnidadesInsumo;

    @IsOptional()
    activo?: boolean;
}