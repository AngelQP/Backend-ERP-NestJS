import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class LoginUserDto {
    
    @Transform( ({value}) => value?.trim().toLowerCase() )
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
    password: string;

}