import { Controller, Get, Param, Query } from '@nestjs/common';
import { InventarioInsumoService } from './inventario-insumo.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ListarInsumosDto } from './interface/Listar-insumo.interface';

@Controller('inventario-insumos')
export class InventarioInsumoController {
  constructor(
    private readonly inventarioService: InventarioInsumoService,
  ) {}

  @Auth(ValidRoles.admin)
  @Get()
  async obtenerInventario(@GetUser() user: User, @Query() query: ListarInsumosDto) {
    return this.inventarioService.listar(user.id, query);
  }

  // @Auth(ValidRoles.admin)
  // @Get()
  // async listarInventario() {
  //   return this.inventarioRepo.find({
  //     relations: ['insumo'],
  //   });
  // }

}
