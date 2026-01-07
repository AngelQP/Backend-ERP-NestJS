import { Injectable } from '@nestjs/common';
import { CreatePostreDto } from './dto/create-postre.dto';
import { UpdatePostreDto } from './dto/update-postre.dto';

@Injectable()
export class PostresService {
  create(createPostreDto: CreatePostreDto) {
    return 'This action adds a new postre';
  }

  findAll() {
    return `This action returns all postres`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postre`;
  }

  update(id: number, updatePostreDto: UpdatePostreDto) {
    return `This action updates a #${id} postre`;
  }

  remove(id: number) {
    return `This action removes a #${id} postre`;
  }
}
