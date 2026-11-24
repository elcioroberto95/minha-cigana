import { Controller, Get, Header, HttpCode, Post, UseGuards } from '@nestjs/common';
import type { Identity } from '../auth/auth.service.js';
import { CurrentIdentity, IdentityGuard } from '../auth/identity.guard.js';
import { DailyCardService } from './daily-card.service.js';

@Controller('api/tarot/daily')
@UseGuards(IdentityGuard)
export class DailyCardController {
  constructor(private readonly daily: DailyCardService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async today(@CurrentIdentity() { owner }: Identity) {
    return { draw: await this.daily.today(owner) };
  }

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async reveal(@CurrentIdentity() { owner }: Identity) {
    return { draw: await this.daily.reveal(owner) };
  }
}
