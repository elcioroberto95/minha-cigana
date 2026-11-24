import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChatModule } from '../chat/chat.module.js';
import { TarotController } from './tarot.controller.js';
import { TarotService } from './tarot.service.js';

@Module({ imports: [AuthModule, ChatModule], controllers: [TarotController], providers: [TarotService] })
export class TarotModule {}
