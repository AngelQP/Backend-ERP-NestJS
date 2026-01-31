import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UnidadesInsumo } from '../enums/unidades-insumos.enum';

export class CreateInsumoDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsEnum(UnidadesInsumo)
    unidad: UnidadesInsumo;
}
