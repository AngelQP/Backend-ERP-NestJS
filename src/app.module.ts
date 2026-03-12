import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostresModule } from './postres/postres.module';
import { InsumosModule } from './insumos/insumos.module';
import { VentasModule } from './ventas/ventas.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MovimientoInsumoModule } from './movimiento-insumo/movimiento-insumo.module';
import { InventarioInsumoModule } from './inventario-insumo/inventario-insumo.module';
import { PreparacionesModule } from './preparaciones/preparaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000,
    }),

    AuthModule,

    PostresModule,

    InsumosModule,

    VentasModule,

    DashboardModule,

    MovimientoInsumoModule,

    InventarioInsumoModule,

    PreparacionesModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
