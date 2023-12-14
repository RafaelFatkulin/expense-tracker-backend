import * as helmet from 'helmet';
import * as requestIp from 'request-ip';
import * as cors from 'cors';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(requestIp.mw());

  // app.use(helmet());
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });
  // app.use(
  //   cors({
  //     origin: '*', // Разрешенный домен
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //     preflightContinue: false,
  //     optionsSuccessStatus: 204,
  //     allowedHeaders: 'Content-Type,Authorization',
  //   }),
  // );

  const options = new DocumentBuilder()
    .setTitle('Expense tracker API')
    .setDescription('NestJS Expense tracker API description')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
