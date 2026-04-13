import { IsString, MinLength, MaxLength, Matches } from "class-validator";

export class ResetPasswordDto {

  @IsString()
  token: string;

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
}