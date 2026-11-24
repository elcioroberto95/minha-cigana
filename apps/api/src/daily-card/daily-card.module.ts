import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DailyCardController } from './daily-card.controller.js';
import { DailyCardService } from './daily-card.service.js';

@Module({ imports: [AuthModule], controllers: [DailyCardController], providers: [DailyCardService], exports: [DailyCardService] })
export class DailyCardModule {}
