import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as requestIp from 'request-ip';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(requestIp.mw());
  app.use(helmet());

  const options = new DocumentBuilder()
    .setTitle('NestJS Hackathon Starter by @ahmetuysal')
    .setDescription('NestJS Hackathon Starter API description')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
