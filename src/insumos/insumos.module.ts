import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { MovimientoInsumo } from './entities/movimientoInsumo.entity';
import { MovimientoInsumoService } from './movimientoInsumo.service';
import { Auth } from 'src/auth/decorators';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [InsumosController],
  providers: [InsumosService, MovimientoInsumoService],
  imports: [
    // Agregar las entidades correspondientes aquí
    TypeOrmModule.forFeature([Insumo, MovimientoInsumo]),
    AuthModule
  ],

  exports: [
    TypeOrmModule
  ]
})
export class InsumosModule {}
