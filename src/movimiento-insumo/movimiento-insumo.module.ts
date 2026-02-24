import { Module } from '@nestjs/common';
import { MovimientoInsumoService } from './movimiento-insumo.service';
import { MovimientoInsumoController } from './movimiento-insumo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoInsumo } from './entities/movimiento-insumo.entity';
import { AuthModule } from 'src/auth/auth.module';
import { InventarioInsumoModule } from 'src/inventario-insumo/inventario-insumo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovimientoInsumo]),
    InventarioInsumoModule,
    AuthModule
  ],
  
  controllers: [MovimientoInsumoController],
  providers: [MovimientoInsumoService],
  exports: [
    MovimientoInsumoService
  ]
})
export class MovimientoInsumoModule {}
