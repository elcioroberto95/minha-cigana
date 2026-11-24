import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DailyCardModule } from '../daily-card/daily-card.module.js';
import { ProfileModule } from '../profile/profile.module.js';
import { ChatController } from './chat.controller.js';
import { OllamaService } from './ollama.service.js';

@Module({ imports: [AuthModule, DailyCardModule, ProfileModule], controllers: [ChatController], providers: [OllamaService], exports: [OllamaService] })
export class ChatModule {}
