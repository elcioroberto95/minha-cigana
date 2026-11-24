import { Controller, Get, Header, Headers, HttpCode, Post } from '@nestjs/common';
import { ownerHash } from '../visitor/visitor-identity.js';
import { DailyCardService } from './daily-card.service.js';

@Controller('api/tarot/daily')
export class DailyCardController {
  constructor(private readonly daily: DailyCardService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async today(@Headers('authorization') authorization?: string) {
    return { draw: await this.daily.today(ownerHash(authorization)) };
  }

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async reveal(@Headers('authorization') authorization?: string) {
    return { draw: await this.daily.reveal(ownerHash(authorization)) };
  }
}
