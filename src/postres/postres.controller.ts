import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostresService } from './postres.service';
import { CreatePostreDto } from './dto/create-postre.dto';
import { UpdatePostreDto } from './dto/update-postre.dto';

@Controller('postres')
export class PostresController {
  constructor(private readonly postresService: PostresService) {}

  @Post()
  create(@Body() createPostreDto: CreatePostreDto) {
    return this.postresService.create(createPostreDto);
  }

  @Get()
  findAll() {
    return this.postresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostreDto: UpdatePostreDto) {
    return this.postresService.update(+id, updatePostreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postresService.remove(+id);
  }
}
