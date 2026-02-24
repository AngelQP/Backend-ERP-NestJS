import { Module } from '@nestjs/common';
import { InventarioInsumoService } from './inventario-insumo.service';
import { InventarioInsumoController } from './inventario-insumo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { InventarioInsumo } from './entities/inventario-insumo.entity';
import { InventarioLote } from './entities/inventario-lote.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([InventarioInsumo, InventarioLote, Insumo]),
    AuthModule
  ],
  
  controllers: [InventarioInsumoController],
  providers: [InventarioInsumoService],
  exports:[
    InventarioInsumoService,
  ]

})
export class InventarioInsumoModule {}
