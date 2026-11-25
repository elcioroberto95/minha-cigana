import { Body, Controller, HttpCode, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentIdentity, IdentityGuard, IdentityMode } from '../auth/identity.guard.js';
import { readChatInput } from './chat-input.js';
import { AnswerConsultation, MissingConsultationIdentity, type ConsultationIdentity } from './application/answer-consultation.js';

@Controller('api/chat')
@UseGuards(IdentityGuard)
export class ChatController {
  constructor(private readonly answerConsultation: AnswerConsultation) {}

  @Post()
  @HttpCode(200)
  @IdentityMode('optional')
  async reply(@Body() body: unknown, @CurrentIdentity() identity?: ConsultationIdentity) {
    try {
      return await this.answerConsultation.execute(readChatInput(body), identity);
    } catch (error) {
      if (error instanceof MissingConsultationIdentity) throw new UnauthorizedException({ error: 'visitor_required' });
      throw error;
    }
  }
}
