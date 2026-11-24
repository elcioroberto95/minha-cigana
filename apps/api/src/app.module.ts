import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ChatModule } from './chat/chat.module.js';
import { HealthModule } from './health/health.module.js';
import { NotFoundFilter } from './not-found.filter.js';

@Module({
  imports: [HealthModule, ChatModule],
  providers: [{ provide: APP_FILTER, useClass: NotFoundFilter }],
})
export class AppModule {}
