import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MovimientoInsumoService } from './movimiento-insumo.service';
import { CreateMovimientoInsumoDto } from './dto/create-movimiento-insumo.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';


@Auth()
@Controller('movimientos-insumos')
export class MovimientoInsumoController {

  constructor(
    private readonly movimientoInsumoService: MovimientoInsumoService
  ) {}

  /** Movimiento de insumos */
  @Auth(ValidRoles.admin)
  @Post()  // -> listo
  registrar(
    @Body() dto: CreateMovimientoInsumoDto,
    @GetUser() user: User,
  ) {
    return this.movimientoInsumoService.registrar(dto, user.id);
  }



}
