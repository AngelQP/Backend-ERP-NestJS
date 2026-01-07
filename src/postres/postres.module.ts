import { Module } from '@nestjs/common';
import { PostresService } from './postres.service';
import { PostresController } from './postres.controller';

@Module({
  controllers: [PostresController],
  providers: [PostresService],
})
export class PostresModule {}
