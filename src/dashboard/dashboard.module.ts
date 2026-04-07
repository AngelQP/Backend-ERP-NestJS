import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoInsumo } from 'src/movimiento-insumo/entities/movimiento-insumo.entity';
import { InventarioInsumo } from 'src/inventario-insumo/entities/inventario-insumo.entity';
import { Postre } from 'src/postres/entities/postre.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({

  imports: [
    TypeOrmModule.forFeature([
      Venta,
      MovimientoInsumo,
      InventarioInsumo,
      Postre
    ]),

    AuthModule
  ],

  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
