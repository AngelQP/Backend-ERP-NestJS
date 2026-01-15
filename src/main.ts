import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { METHODS } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir solicitudes desde Front de prueba
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }); 

  // Validaciones para lo que venga dentro de la request
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Coloca el prefijo de "api" antes de las rutas
  app.setGlobalPrefix('api');


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
