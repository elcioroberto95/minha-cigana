import { BadRequestException } from '@nestjs/common';
import { maxChatHistory } from './chat-config.js';
import { chatTopics } from './domain/consultation.js';
import { isVisitorRecordId } from '../visitor/visitor-identity.js';

export type { ChatLocale } from './domain/consultation.js';

type ChatMessage = { role: 'user' | 'assistant'; content: string; model?: string };

function invalid(): never {
  throw new BadRequestException({ error: 'invalid_chat_request' });
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown, max: number) {
  if (typeof value !== 'string') invalid();
  const text = value.trim();
  if (!text || text.length > max) invalid();
  return text;
}

export function readTopic(topic: unknown) {
  const selectedTopic = chatTopics.find((option) => option === topic);
  if (!selectedTopic) invalid();
  return selectedTopic;
}

export function readMessages(history: unknown, limit: number): ChatMessage[] {
  if (!Array.isArray(history) || history.length > limit || history.length % 2 !== 0) invalid();
  return history.map((entry: unknown, index): ChatMessage => {
    const role = index % 2 === 0 ? 'user' : 'assistant';
    if (!isObject(entry) || entry.role !== role) invalid();
    const model = role === 'assistant' && typeof entry.model === 'string' && entry.model.length <= 200
      ? entry.model : undefined;
    return { role, content: readText(entry.content, role === 'user' ? 500 : 2000), model };
  });
}

export function readChatInput(body: unknown) {
  if (!isObject(body)) invalid();
  const { locale, topic, message, history = [], dailyCardId, drawId } = body;
  const supportedLocale = (['pt-BR', 'en-US'] as const).find((value) => value === locale);
  if (!supportedLocale) invalid();
  if (dailyCardId !== undefined && !isVisitorRecordId(dailyCardId)) invalid();
  if (drawId !== undefined && (!isVisitorRecordId(drawId) || dailyCardId !== undefined)) invalid();
  const previous = readMessages(history, maxChatHistory).map(({ role, content }) => ({ role, content }));
  return { locale: supportedLocale, topic: readTopic(topic), message: readText(message, 500), history: previous, dailyCardId, drawId };
}
