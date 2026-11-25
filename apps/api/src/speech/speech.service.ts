import { HttpException, HttpStatus, Injectable, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class SpeechService {
  private active = 0;

  available() { return Boolean(process.env.SPEECH_TRANSCRIPTION_URL); }

  async transcribe(bytes: Buffer, mime: string, extension: string, language: 'pt' | 'en') {
    const endpoint = process.env.SPEECH_TRANSCRIPTION_URL;
    if (!endpoint) throw new ServiceUnavailableException({ error: 'transcription_unavailable' });
    if (this.active >= 2) throw new HttpException({ error: 'transcription_busy' }, HttpStatus.TOO_MANY_REQUESTS);
    this.active++;
    let body: { text?: unknown };
    try {
      const form = new FormData();
      form.append('file', new Blob([Uint8Array.from(bytes)], { type: mime }), `question.${extension}`);
      form.append('model', process.env.SPEECH_TRANSCRIPTION_MODEL || 'whisper-1');
      form.append('language', language);
      const key = process.env.SPEECH_TRANSCRIPTION_KEY;
      const response = await fetch(endpoint, {
        method: 'POST', body: form, headers: key ? { Authorization: `Bearer ${key}` } : {},
        redirect: 'error', signal: AbortSignal.timeout(45_000),
      });
      if (!response.ok) throw new Error('Transcriber unavailable');
      body = await response.json() as { text?: unknown };
    } catch {
      throw new ServiceUnavailableException({ error: 'transcription_unavailable' });
    } finally {
      this.active--;
    }
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text) throw new UnprocessableEntityException({ error: 'empty_transcription' });
    return text.slice(0, 500);
  }
}
