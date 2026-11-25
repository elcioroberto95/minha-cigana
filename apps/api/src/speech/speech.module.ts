import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SpeechController } from './speech.controller.js';
import { SpeechService } from './speech.service.js';

@Module({ imports: [AuthModule], controllers: [SpeechController], providers: [SpeechService] })
export class SpeechModule {}
