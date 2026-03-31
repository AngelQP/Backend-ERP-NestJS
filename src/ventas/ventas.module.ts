import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalleVenta.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({

  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta]),
    AuthModule
  ],

  controllers: [VentasController],
  providers: [VentasService],

  exports: [VentasService]
})
export class VentasModule {}
