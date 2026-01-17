import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';
import { Auth, GetUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // EndPoint para la creacion o registro de un usuario
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  // EndPoint para el login de un usuario
  @HttpCode(HttpStatus.OK) 
  @Post('login')
  create(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // Queda con un solo decorador que es Auth
  @Get('private3')
  @Auth(ValidRoles.admin)
  testgPrivateRoute3( 
    @GetUser() user: User,
  ) {
     return {
       ok: true,
       user,
     }
  }

  
}