import { Module } from '@nestjs/common';
import { DailyCardController } from './daily-card.controller.js';
import { DailyCardService } from './daily-card.service.js';

@Module({ controllers: [DailyCardController], providers: [DailyCardService], exports: [DailyCardService] })
export class DailyCardModule {}
