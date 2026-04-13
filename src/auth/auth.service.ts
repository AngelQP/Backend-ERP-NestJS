import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import {bcryptAdapter} from './helper/AdapterBcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { VerificationTokenService } from 'src/verification-token/verification-token.service';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    private readonly verificationTokenService: VerificationTokenService 

  ){}

  // Creacion de un usuario 
  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create( { 
        ...userData,
        password: bcryptAdapter.hash(password),
        isEmailVerified: false
      } );

      await this.userRepository.save(user);

      // Generar token
      await this.verificationTokenService.createVerificationToken(user.email, 'verify');

      // retorno mediante DTO
      return {
        message: 'Usuario creado. Revisa tu correo para verificar tu cuenta'
      };

    } catch (error) {
        this.handleDBErrors(error);
    }
  }

  async resetPassword(tokenValue: string, newPassword: string) {

    const token = await this.verificationTokenService.validateToken(tokenValue);

    if (token.type !== 'reset') {
      throw new BadRequestException('Token inválido');
    }

    const user = token.user;

    user.password = bcryptAdapter.hash(newPassword);

    await this.userRepository.save(user);

    // invalidar los tokens anteriores del usuario (ejemplo: al cambiar contraseña)
    await this.verificationTokenService.invalidateAllUserTokens(user.id);

    await this.verificationTokenService.markAsUsed(token);

    return {
      message: 'Contraseña actualizada correctamente'
    };
  }

  // Logeo de un usuario
  async login( loginUserDto: LoginUserDto): Promise<UserResponseDto> {

    const {password, email} = loginUserDto;

    // en la consulta solo retorna email y password
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, name: true, lastName: true, isEmailVerified: true}
    });

    if ( !user ) 
      throw new UnauthorizedException('Credenciales no válidas');
    

    if( !bcryptAdapter.compare(password, user.password) )
      throw new UnauthorizedException('Credenciales no válidas');

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Debes verificar tu correo antes de iniciar sesión');
    }

    // Eliminacion de password
    const { password: passwordUser, ...userWithoutPassword} = user;
    
    // retorno mediante DTO
    return this.buildAuthResponse(userWithoutPassword as User);

  }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload, {
      expiresIn: '1d'
    } );
    return token;

  }

  private handleDBErrors( error: any ): never {

    if( error.code === '23505' ) 
    {
      if( error.detail.includes('email') ) {
        throw new BadRequestException({
          title: 'EMAIL_ALREADY_EXISTS',
          message: 'El email ya está registrado.'
        });
      }

      if( error.detail.includes('phone') ) {
        throw new BadRequestException({
          title: 'PHONE_ALREADY_EXISTS',
          message: 'El número de teléfono ya está registrado.'
        });
      }

      throw new BadRequestException({
        title: 'UNIQUE_CONSTRAINT_VIOLATION',
        message: 'El registro ya existe.'
      });
    }

    console.log(error);

    throw new InternalServerErrorException('Checa los server logs.')
  }

  // Estandar de respuesta UserResponseDTO para Login y Create
  private buildAuthResponse(user: User): UserResponseDto {

    return plainToInstance(
        UserResponseDto,
        {...user, token: this.getJwtToken({id: user.id})}, 
        // Incluye en el resultado FINAL solo las propiedades que estén explícitamente marcadas con @Expose() en el DTO
        {excludeExtraneousValues: true}
      );
  }

  async requestPasswordReset(email: string) {

    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      // ⚠️ no revelar si existe o no
      return {
        message: 'Si el correo existe, se enviará un enlace'
      };
    }

    await this.verificationTokenService.createVerificationToken(email, 'reset');

    return {
      message: 'Si el correo existe, se enviará un enlace'
    };
  }

  
}