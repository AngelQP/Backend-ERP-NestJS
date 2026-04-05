import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseUUIDPipe, Query } from '@nestjs/common';
import { PostresService } from './postres.service';
import { CreatePostreDto } from './dto/create-postre.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { UpdatePostreDto } from './dto/update-postre.dto';
import { FilterPostresDto } from './dto/filter-postre.dto';

@Auth()
@Controller('postres')
export class PostresController {
  constructor(private readonly postresService: PostresService) {}

  @Auth(ValidRoles.admin)
  @Post()
  create(@Body() createPostreDto: CreatePostreDto, @GetUser() user: User) {
    return this.postresService.create(createPostreDto, user.id);
  }

  @Auth(ValidRoles.admin)
  @Get()
  findAll(@GetUser() user: User, @Query() filtro: FilterPostresDto) {
    return this.postresService.findAll(user.id, filtro);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postresService.findOne(+id);
  // }

  @Auth(ValidRoles.admin)
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostreDto,
    @GetUser() user: User,
  ) {
    return this.postresService.update(id, dto, user.id);
  }

  @Auth(ValidRoles.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.postresService.remove(id, user.id);
  }
}
