import { Controller, Get, Param } from '@nestjs/common';
import { InventarioInsumoService } from './inventario-insumo.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('inventario-insumos')
export class InventarioInsumoController {
  constructor(
    private readonly inventarioService: InventarioInsumoService,
  ) {}

  @Auth(ValidRoles.admin)
  @Get()
  async obtenerInventario(@GetUser() user: User) {
    return this.inventarioService.listar(user.id);
  }

  // @Auth(ValidRoles.admin)
  // @Get()
  // async listarInventario() {
  //   return this.inventarioRepo.find({
  //     relations: ['insumo'],
  //   });
  // }

}
