import { Body, Controller, HttpCode, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { DailyCardService } from '../daily-card/daily-card.service.js';
import { ProfileService } from '../profile/profile.service.js';
import type { Identity } from '../auth/auth.service.js';
import { CurrentIdentity, IdentityGuard, IdentityMode } from '../auth/identity.guard.js';
import { readChatInput } from './chat-input.js';
import { OllamaService } from './ollama.service.js';

@Controller('api/chat')
@UseGuards(IdentityGuard)
export class ChatController {
  constructor(
    private readonly ollama: OllamaService,
    private readonly daily: DailyCardService,
    private readonly profiles: ProfileService,
  ) {}

  @Post()
  @HttpCode(200)
  @IdentityMode('optional')
  async reply(@Body() body: unknown, @CurrentIdentity() identity?: Identity) {
    const input = readChatInput(body);
    const owner = identity?.owner;
    if (input.dailyCardId && !owner) throw new UnauthorizedException({ error: 'visitor_required' });
    const card = input.dailyCardId && owner ? await this.daily.ownedCard(owner, input.dailyCardId) : undefined;
    const personal = owner ? await this.profiles.chatContext(owner, input.topic) : undefined;
    return this.ollama.reply(input, {
      daily: card?.readings[input.locale],
      personal,
      lookupDailyCard: owner && !input.dailyCardId
        ? async () => (await this.daily.today(owner))?.card.readings[input.locale]
        : undefined,
    });
  }
}
