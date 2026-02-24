import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
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
  // Validaciones para lo que venga dentro de la request
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {

        const mensajes: string[] = [];

        const extraerErrores = (errores: any[]) => {
          for (const error of errores) {

            if (error.constraints) {
              mensajes.push(...Object.values(error.constraints) as string[]);
            }

            if (error.children && error.children.length > 0) {
              extraerErrores(error.children);
            }
          }
        };

        extraerErrores(errors);

        return new BadRequestException({
          statusCode: 400,
          message: mensajes,
          error: 'Bad Request',
        });
      },
    }),
  );

  // Coloca el prefijo de "api" antes de las rutas
  app.setGlobalPrefix('api');


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
