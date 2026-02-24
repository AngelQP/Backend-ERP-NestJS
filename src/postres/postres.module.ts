import { Module } from '@nestjs/common';
import { PostresService } from './postres.service';
import { PostresController } from './postres.controller';
import { Postre } from './entities/postre.entity';
import { RecetaDetalle } from './entities/recetaDetalle.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({

  imports: [
    TypeOrmModule.forFeature([Postre, RecetaDetalle, Insumo]),
    AuthModule
  ],

  controllers: [PostresController],
  providers: [PostresService],
  exports: [
    PostresService,
  ]
})
export class PostresModule {}
