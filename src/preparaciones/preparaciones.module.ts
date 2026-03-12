import { Module } from '@nestjs/common';
import { PreparacionesService } from './preparaciones.service';
import { PreparacionesController } from './preparaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preparacion } from './entities/preparacione.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MovimientoInsumoModule } from 'src/movimiento-insumo/movimiento-insumo.module';
import { DetallePreparacion } from './entities/detallePreparacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Preparacion, DetallePreparacion]),
    AuthModule,
    MovimientoInsumoModule
  ],
  controllers: [PreparacionesController],
  providers: [PreparacionesService],

  exports: [PreparacionesService],
})
export class PreparacionesModule {}
