import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [InsumosController],
  providers: [InsumosService],
  imports: [
    // Agregar las entidades correspondientes aquí
    TypeOrmModule.forFeature([Insumo]),
    AuthModule
  ],

  exports: [
    InsumosService
  ]
})
export class InsumosModule {}
