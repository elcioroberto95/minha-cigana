import { Body, Controller, Get, Header, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import type { Identity } from '../auth/auth.service.js';
import { CurrentIdentity, IdentityGuard } from '../auth/identity.guard.js';
import { drawId, readDraw } from './tarot-input.js';
import { TarotService } from './tarot.service.js';

@Controller('api/tarot')
@UseGuards(IdentityGuard)
export class TarotController {
  constructor(private readonly tarot: TarotService) {}

  @Post('pilot/:id/start')
  @HttpCode(204)
  startPilot(@CurrentIdentity() { owner }: Identity, @Param('id') id: string) {
    return this.tarot.recordPilotStart(owner, drawId(id));
  }

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

  @Post('draw/:id/audio-started')
  @HttpCode(204)
  audioStarted(@CurrentIdentity() { owner }: Identity, @Param('id') id: string) {
    return this.tarot.recordPilotEvent(owner, drawId(id), 'audio_started');
  }

  @Post('interpret/:id')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  interpret(@CurrentIdentity() { owner }: Identity, @Param('id') id: string) {
    return this.tarot.interpret(owner, drawId(id));
  }
}
