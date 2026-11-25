import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DailyCardModule } from '../daily-card/daily-card.module.js';
import { DailyCardService } from '../daily-card/daily-card.service.js';
import { ConsultationMemory } from '../profile/application/consultation-memory.js';
import { ProfileModule } from '../profile/profile.module.js';
import { TarotModule } from '../tarot/tarot.module.js';
import { TarotService } from '../tarot/tarot.service.js';
import { AnswerConsultation } from './application/answer-consultation.js';
import { ChatController } from './chat.controller.js';
import { OllamaService } from './ollama.service.js';
import { OllamaModule } from './ollama.module.js';

@Module({
  imports: [AuthModule, DailyCardModule, ProfileModule, TarotModule, OllamaModule],
  controllers: [ChatController],
  providers: [
    {
      provide: AnswerConsultation,
      inject: [OllamaService, DailyCardService, ConsultationMemory, TarotService],
      useFactory: (ollama: OllamaService, cardService: DailyCardService, memory: ConsultationMemory, tarot: TarotService) =>
        new AnswerConsultation({
          generate: (input, options) => ollama.reply(input, options),
          memory,
          spreads: (owner, id, locale) => tarot.consultationContext(owner, id, locale),
          dailyCards: {
            byId: async (owner, id, locale) => (await cardService.ownedCard(owner, id)).readings[locale],
            today: async (owner, locale) => (await cardService.today(owner))?.card.readings[locale],
          },
        }),
    },
  ],
})
export class ChatModule {}
