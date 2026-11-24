import { readFile } from 'node:fs/promises';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { readChatInput } from './chat-input.js';
import { defaultPersona } from './persona.js';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  async reply({ locale, topic, message, history }: ReturnType<typeof readChatInput>) {
    const model = process.env.OLLAMA_MODEL?.trim();
    if (!model) throw new ServiceUnavailableException({ error: 'chat_unavailable' });

    try {
      const base = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
      const persona = process.env.CHAT_PERSONA_FILE
        ? await readFile(process.env.CHAT_PERSONA_FILE, 'utf8')
        : defaultPersona;
      const response = await fetch(new URL('/api/chat', base), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(90_000),
        body: JSON.stringify({
          model,
          stream: false,
          options: { num_predict: 256 },
          messages: [
            { role: 'system', content: `${persona}\nIdioma da resposta: ${locale}. Tema sugerido: ${topic}.` },
            ...history,
            { role: 'user', content: message },
          ],
        }),
      });

      if (!response.ok) throw new Error('Ollama HTTP ' + response.status);
      const result = await response.json() as { message?: { content?: unknown }; model?: unknown } | null;
      const content = result?.message?.content;
      if (typeof content !== 'string' || !content.trim()) throw new Error('Invalid Ollama response');

      return {
        reply: content.trim().slice(0, 2000),
        model: typeof result?.model === 'string' ? result.model : model,
      };
    } catch {
      this.logger.warn('Falha na comunicação com o provedor de inferência.');
      throw new ServiceUnavailableException({ error: 'chat_unavailable' });
    }
  }
}
