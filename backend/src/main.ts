import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3001',
      ),
      'http://127.0.0.1:3001',
      'http://192.168.1.130:3001',
      'http://192.168.192.143:3001',
    ],
    credentials: true,
  });

  const port = configService.get<number>('BACKEND_PORT', 3000);
  const host = configService.get<string>(
    'BACKEND_HOST',
    '127.0.0.1',
  );

  await app.listen(port, host);
}

void bootstrap();