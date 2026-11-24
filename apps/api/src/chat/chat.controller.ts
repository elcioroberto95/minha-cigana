import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { DailyCardService } from '../daily-card/daily-card.service.js';
import { ownerHash } from '../visitor/visitor-identity.js';
import { readChatInput } from './chat-input.js';
import { OllamaService } from './ollama.service.js';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly ollama: OllamaService, private readonly daily: DailyCardService) {}

  @Post()
  @HttpCode(200)
  async reply(@Body() body: unknown, @Headers('authorization') authorization?: string) {
    const input = readChatInput(body);
    const card = input.dailyCardId ? await this.daily.ownedCard(ownerHash(authorization), input.dailyCardId) : undefined;
    return this.ollama.reply(input, card?.readings[input.locale]);
  }
}
