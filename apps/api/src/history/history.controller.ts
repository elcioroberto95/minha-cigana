import { Body, Controller, Delete, Get, Header, Headers, HttpCode, Param, Put } from '@nestjs/common';
import { ownerHash, readSession, readSessionId } from './history-input.js';
import { HistoryService } from './history.service.js';

@Controller('api/history')
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(@Headers('authorization') auth?: string) {
    return this.history.list(ownerHash(auth));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  detail(@Headers('authorization') auth: string | undefined, @Param('id') id: string) {
    return this.history.detail(ownerHash(auth), readSessionId(id));
  }

  @Put(':id')
  save(@Headers('authorization') auth: string | undefined, @Param('id') id: string, @Body() body: unknown) {
    return this.history.save(ownerHash(auth), readSessionId(id), readSession(body));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Headers('authorization') auth: string | undefined, @Param('id') id: string) {
    return this.history.remove(ownerHash(auth), readSessionId(id));
  }
}
