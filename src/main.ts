import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes( new ValidationPipe({transform: true}))
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  const option = new DocumentBuilder()
    .setTitle('Practice App Api')
    .setDescription('List of Practice App Api')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Jwt Token',
        in: 'header',
      },
      'access-token',
    )
    .setExternalDoc('Postman Collection', '/api-tester-json')
    .build();
  const document = SwaggerModule.createDocument(app, option);
  SwaggerModule.setup('api/v1/api-tester', app, document);

  await app.listen(8000);
}
bootstrap();