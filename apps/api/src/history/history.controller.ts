import { Body, Controller, Delete, Get, Header, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import type { Identity } from '../auth/auth.service.js';
import { CurrentIdentity, IdentityGuard } from '../auth/identity.guard.js';
import { readSession, readSessionId } from './history-input.js';
import { HistoryService } from './history.service.js';

@Controller('api/history')
@UseGuards(IdentityGuard)
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(@CurrentIdentity() { owner }: Identity) {
    return this.history.list(owner);
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  detail(@CurrentIdentity() { owner }: Identity, @Param('id') id: string) {
    return this.history.detail(owner, readSessionId(id));
  }

  @Put(':id')
  save(@CurrentIdentity() { owner }: Identity, @Param('id') id: string, @Body() body: unknown) {
    return this.history.save(owner, readSessionId(id), readSession(body));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentIdentity() { owner }: Identity, @Param('id') id: string) {
    return this.history.remove(owner, readSessionId(id));
  }
}
