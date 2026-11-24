import { createHash } from 'node:crypto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { isObject, readMessages, readTopic } from '../chat/chat-input.js';

export function ownerHash(authorization: string | undefined) {
  const token = /^Bearer ([a-f0-9]{64})$/.exec(authorization ?? '')?.[1];
  if (!token) throw new UnauthorizedException({ error: 'visitor_required' });
  return createHash('sha256').update(token).digest('hex');
}

export function readSessionId(value: string) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value)) {
    throw new BadRequestException({ error: 'invalid_session_id' });
  }
  return value;
}

export function readSession(body: unknown) {
  if (!isObject(body) || !Array.isArray(body.messages) || !body.messages.length) {
    throw new BadRequestException({ error: 'invalid_history_request' });
  }
  return { topic: readTopic(body.topic), messages: readMessages(body.messages, 40) };
}
