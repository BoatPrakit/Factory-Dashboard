import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTransform } from './utils/interceptor/response-transform.interceptor';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const httpsOptions = {
    cert: fs.readFileSync(path.resolve(__dirname, '/ssl/certificate.pem')),
    key: fs.readFileSync(path.resolve(__dirname, '/ssl/privatekey.pem')),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.useGlobalInterceptors(new ResponseTransform());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,PUT,POST,DELETE',
  });
  // app.useGlobalFilters(new PrismaNotFoundExceptionFilter());
  app.setGlobalPrefix('/api');
  await app.listen(3000);
}
bootstrap();
