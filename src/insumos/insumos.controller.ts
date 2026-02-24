import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { UnidadesInsumo } from './enums/unidades-insumos.enum';
import { TipoMovimiento } from './enums/tipo-movimiento-insumo.enum';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Auth()
@Controller('insumos')
export class InsumosController {

  constructor(
    private readonly insumosService: InsumosService,
  ) {}

  @Auth(ValidRoles.admin)
  @Post() // -> listo
  create(@Body() createInsumoDto: CreateInsumoDto, @GetUser() user: User) {
    return this.insumosService.create(createInsumoDto, user.id);
  }

  // Test -> permite verificar el usuario autenticado
  @Auth(ValidRoles.admin)
  @Get('test-auth')
  testAuth(@GetUser() user: User) {
    return {
      message: 'Hello World',
      user
    }
  }

  /** URI para listar las unidades de medida */
  @Auth(ValidRoles.admin)
  @Get('unidades') // -> listo
  getUnidades() {
    /** retorno
     * { "key": "KG", "label": "Kg", "value": "KG" }
     */
    return Object.entries(UnidadesInsumo).map(([key, value]) => ({
      key,
      value,
      label: key.charAt(0) + key.slice(1).toLowerCase(),
    }));
  }

  /** URI para listar las unidades de movimiento -> Ingreso / Salida / Ajuste */
  @Auth(ValidRoles.admin)
  @Get('unidades-movimiento') // -> listo
  getTipoMovimiento() {
    /** retorno
     *{
        value: TipoMovimiento.VALUE, // INGRESO | SALIDA | AJUSTE
        label: 'Ajuste de inventario',
        descripcion: 'Corrección manual de stock',
        permiteNegativo: true,
      }
     */
    return [
    {
      value: TipoMovimiento.INGRESO,
      label: 'Entrada de insumo',
      descripcion: 'Ingreso de insumos al almacén',
      permiteNegativo: false,
    },
    {
      value: TipoMovimiento.SALIDA,
      label: 'Salida de insumo',
      descripcion: 'Consumo o venta de insumos',
      permiteNegativo: false,
    },
    {
      value: TipoMovimiento.AJUSTE,
      label: 'Ajuste de inventario',
      descripcion: 'Corrección manual de stock',
      permiteNegativo: true,
    },
  ];
  }

  @Get() // -> listo
  @Auth(ValidRoles.admin)
  findAll(@GetUser() user: User) {
    return this.insumosService.findAll(user.id);
  }

  @Auth(ValidRoles.admin)
  @Get(':id') // -> listo
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.insumosService.findOne(id);
  }

  @Auth(ValidRoles.admin)
  @Patch(':id') // -> listo
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateInsumoDto: UpdateInsumoDto,
  ) {
    return this.insumosService.update(id, updateInsumoDto);
  }

  @Auth(ValidRoles.admin)
  @Delete(':id') //-> listo
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.insumosService.remove(id);
  }
  
}
