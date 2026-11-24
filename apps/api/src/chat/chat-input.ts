import { BadRequestException } from '@nestjs/common';

const topics = ['love', 'money', 'work', 'future', 'spirituality', 'general'] as const;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

function invalid(): never {
  throw new BadRequestException({ error: 'invalid_chat_request' });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown, max: number) {
  if (typeof value !== 'string') invalid();
  const text = value.trim();
  if (!text || text.length > max) invalid();
  return text;
}

export function readChatInput(body: unknown) {
  if (!isObject(body)) invalid();
  const { locale, topic, message, history = [] } = body;
  if (locale !== 'pt-BR' && locale !== 'en-US') invalid();
  const selectedTopic = topics.find((option) => option === topic);
  if (!selectedTopic || !Array.isArray(history) || history.length > 8 || history.length % 2 !== 0) invalid();

  const previous = history.map((entry: unknown, index): ChatMessage => {
    const role = index % 2 === 0 ? 'user' : 'assistant';
    if (!isObject(entry) || entry.role !== role) invalid();
    return { role, content: readText(entry.content, role === 'user' ? 500 : 2000) };
  });

  return { locale, topic: selectedTopic, message: readText(message, 500), history: previous };
}
