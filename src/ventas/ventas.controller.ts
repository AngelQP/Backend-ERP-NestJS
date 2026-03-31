import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateDetalleVentaDto, CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { ListarVentasDto } from './dto/listar-ventas.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Auth(ValidRoles.admin)
  @Post()
  create(@Body() createVentaDetalleDto: CreateDetalleVentaDto, @GetUser() user: User) {
    return this.ventasService.crearVenta(createVentaDetalleDto, user);
  }

  @Auth(ValidRoles.admin)
  @Get()
  findAll(
    @GetUser() user: User, 
    @Query() query: ListarVentasDto
  ) {
    return this.ventasService.listarVentas(user, query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ventasService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
  //   return this.ventasService.update(+id, updateVentaDto);
  // }

  @Auth(ValidRoles.admin)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ) {
    return this.ventasService.anularVenta(id, user);
  }
}
