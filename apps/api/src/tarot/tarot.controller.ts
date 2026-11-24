import { Body, Controller, Get, Header, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import type { Identity } from '../auth/auth.service.js';
import { CurrentIdentity, IdentityGuard } from '../auth/identity.guard.js';
import { drawId, readDraw } from './tarot-input.js';
import { TarotService } from './tarot.service.js';

@Controller('api/tarot')
@UseGuards(IdentityGuard)
export class TarotController {
  constructor(private readonly tarot: TarotService) {}

  @Post('draw')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  draw(@CurrentIdentity() { owner }: Identity, @Body() body: unknown) {
    return this.tarot.draw(owner, readDraw(body));
  }

  @Get('draw/:id')
  @Header('Cache-Control', 'no-store')
  get(@CurrentIdentity() { owner }: Identity, @Param('id') id: string) {
    return this.tarot.get(owner, drawId(id));
  }

  @Post('interpret/:id')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  interpret(@CurrentIdentity() { owner }: Identity, @Param('id') id: string) {
    return this.tarot.interpret(owner, drawId(id));
  }
}
