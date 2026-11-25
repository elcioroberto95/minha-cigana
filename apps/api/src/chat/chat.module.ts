import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DailyCardModule } from '../daily-card/daily-card.module.js';
import { DailyCardService } from '../daily-card/daily-card.service.js';
import { ConsultationMemory } from '../profile/application/consultation-memory.js';
import { ProfileModule } from '../profile/profile.module.js';
import { AnswerConsultation } from './application/answer-consultation.js';
import { ChatController } from './chat.controller.js';
import { OllamaService } from './ollama.service.js';

@Module({
  imports: [AuthModule, DailyCardModule, ProfileModule],
  controllers: [ChatController],
  providers: [
    OllamaService,
    {
      provide: AnswerConsultation,
      inject: [OllamaService, DailyCardService, ConsultationMemory],
      useFactory: (ollama: OllamaService, cardService: DailyCardService, memory: ConsultationMemory) =>
        new AnswerConsultation({
          generate: (input, options) => ollama.reply(input, options),
          memory,
          dailyCards: {
            byId: async (owner, id, locale) => (await cardService.ownedCard(owner, id)).readings[locale],
            today: async (owner, locale) => (await cardService.today(owner))?.card.readings[locale],
          },
        }),
    },
  ],
  exports: [OllamaService],
})
export class ChatModule {}
