import { existsSync } from 'node:fs';
import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  if (existsSync('.env')) process.loadEnvFile('.env');

  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || '3000');

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
  }

  const app = await NestFactory.create(AppModule, { logger: new ConsoleLogger({ json: true }) });
  app.enableShutdownHooks();
  const origins = (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
  if (origins.length) app.enableCors({ origin: origins, exposedHeaders: ['X-Request-ID'] });
  await app.listen(port, host);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
