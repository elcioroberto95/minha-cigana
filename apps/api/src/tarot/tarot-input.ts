import { BadRequestException } from '@nestjs/common';
import { isObject, readTopic, type ChatLocale } from '../chat/chat-input.js';
import { isVisitorRecordId } from '../visitor/visitor-identity.js';
import { spreads, type TarotFormat } from './deck.js';

function invalid(): never {
  throw new BadRequestException({ error: 'invalid_tarot_request' });
}

export function drawId(value: unknown) {
  if (!isVisitorRecordId(value)) invalid();
  return value;
}

export function readDraw(body: unknown) {
  if (!isObject(body)) invalid();
  const format = (Object.keys(spreads) as TarotFormat[]).find((item) => item === body.format);
  const locale: ChatLocale | undefined = body.locale === 'pt-BR' || body.locale === 'en-US' ? body.locale : undefined;
  const question = body.question ?? '';
  if (!format || !locale || typeof question !== 'string' || question.trim().length > 500 || question.includes('\u0000')) invalid();
  const count = spreads[format].positions.length;
  const slots = body.slots ?? Array.from({ length: count }, (_, index) => index);
  if (!Array.isArray(slots) || slots.length !== count || new Set(slots).size !== count ||
      slots.some((slot: unknown) => typeof slot !== 'number' || !Number.isInteger(slot) || slot < 0 || slot >= count + 4)) invalid();
  return { id: drawId(body.id), format, locale, topic: readTopic(body.topic ?? 'general'), question: question.trim(), slots: slots as number[] };
}
