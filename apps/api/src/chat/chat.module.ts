import { Module } from '@nestjs/common';
import { DailyCardModule } from '../daily-card/daily-card.module.js';
import { ChatController } from './chat.controller.js';
import { OllamaService } from './ollama.service.js';

@Module({ imports: [DailyCardModule], controllers: [ChatController], providers: [OllamaService] })
export class ChatModule {}
