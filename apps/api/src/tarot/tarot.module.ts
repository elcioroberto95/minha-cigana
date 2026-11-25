import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OllamaModule } from '../chat/ollama.module.js';
import { TarotController } from './tarot.controller.js';
import { TarotService } from './tarot.service.js';

@Module({ imports: [AuthModule, OllamaModule], controllers: [TarotController], providers: [TarotService], exports: [TarotService] })
export class TarotModule {}
