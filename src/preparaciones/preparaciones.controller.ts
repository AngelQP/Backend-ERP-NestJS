import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { PreparacionesService } from './preparaciones.service';
import { CreatePreparacionDto } from './dto/create-preparacione.dto';
// import { UpdatePreparacioneDto } from './dto/update-preparacione.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { UpdatePreparacionDto } from './dto/update-preparacione.dto';
import { FindPreparacionesDto } from './dto/include-anuladas.dto';
import { EstadoPreparacion } from './interfaces/preparaciones.type';

@Controller('preparaciones')
export class PreparacionesController {
  constructor(private readonly preparacionesService: PreparacionesService) {}

  @Auth(ValidRoles.admin)
  @Post()
  create(@Body() createPreparacioneDto: CreatePreparacionDto, @GetUser() user:User) {
    return this.preparacionesService.create(createPreparacioneDto, user.id);
  }
  
  @Auth(ValidRoles.admin)
  @Get()
  findAll(
    @GetUser() user: User,
    @Query() includeAnuladas: FindPreparacionesDto
  ) {
    return this.preparacionesService.findAll(user.id, includeAnuladas);
  }

  @Auth(ValidRoles.admin)
  @Get('/estados')
  getEstadosPreparacion() {
    return this.preparacionesService.listarEstadosPreparacion();
  }
  
  @Auth(ValidRoles.admin)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePreparacioneDto: UpdatePreparacionDto,
    @GetUser() user: User
  ) {
    return this.preparacionesService.remove(id, updatePreparacioneDto, user.id);
  }
}
