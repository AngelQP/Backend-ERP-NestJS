import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
