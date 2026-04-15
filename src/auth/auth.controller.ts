import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
// import { User } from './entities/user.entity';
// import { ValidRoles } from './interfaces';
// import { Auth, GetUser } from './decorators';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  // @Get('private3')
  // @Auth(ValidRoles.admin)
  // testgPrivateRoute3( 
  //   @GetUser() user: User,
  // ) {
  //    return {
  //      ok: true,
  //      user,
  //    }
  // }

  @Post('request-password-reset')
  requestReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  
}