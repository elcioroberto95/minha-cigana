import { BadRequestException, Body, Controller, Get, Header, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdentityGuard, IdentityMode } from '../auth/identity.guard.js';
import { SpeechService } from './speech.service.js';

const formats = new Map([
  ['audio/webm', 'webm'], ['audio/mp4', 'm4a'], ['audio/x-m4a', 'm4a'],
  ['audio/m4a', 'm4a'], ['audio/wav', 'wav'], ['audio/ogg', 'ogg'],
]);

@Controller('api/speech')
@UseGuards(IdentityGuard)
export class SpeechController {
  constructor(private readonly speech: SpeechService) {}

  @Get()
  @IdentityMode('account')
  @Header('Cache-Control', 'no-store')
  status() {
    return { transcription: this.speech.available() };
  }

  @Post('transcribe')
  @IdentityMode('account')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: 1024 * 1024, files: 1, fields: 1, fieldSize: 16 } }))
  async transcribe(@UploadedFile() file: { mimetype: string; buffer: Buffer } | undefined, @Body('locale') locale: unknown) {
    const extension = file && formats.get(file.mimetype);
    if (!extension || !file?.buffer.length || (locale !== 'pt-BR' && locale !== 'en-US')) {
      throw new BadRequestException({ error: 'invalid_audio' });
    }
    return { text: await this.speech.transcribe(file.buffer, file.mimetype, extension, locale === 'pt-BR' ? 'pt' : 'en') };
  }
}
