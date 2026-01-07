import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsNumberString, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {
    
    @Transform( ({value}) => value?.trim().toLowerCase() )
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        // /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 
        /* Caracteres aceptados
            !, @, #, $, %, ^, &, *, (, ), -, +, =, ~
            [, ], {, }, `
            <, >, ,, ., ?, /
            _
        */
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/,
        { message: 'La contraseña debe tener una letra mayuscula, minuscula y un numero'
    })
    password: string;

    @Transform( ({value}) => value?.trim() )
    @IsString()
    @IsNotEmpty()
    name: string;

    @Transform( ({value}) => value?.trim() )
    @IsString()
    @IsNotEmpty()
    lastName: string;

    // El contexto de cantidad de digitos es para Perú
    @Transform( ({value}) => value?.trim() )
    @IsNumberString({}, { message: 'El teléfono debe contener solo números' })
    @Length(9, 9, { message: 'El teléfono debe tener exactamente 9 dígitos' })
    phone: string;

}
