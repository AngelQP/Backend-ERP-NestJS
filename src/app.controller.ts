import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from './auth/decorators';
import { ValidRoles } from './auth/interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Auth(ValidRoles.seller)
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
