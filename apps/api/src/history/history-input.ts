import { BadRequestException } from '@nestjs/common';
import { isObject, readMessages, readTopic } from '../chat/chat-input.js';
import { isVisitorRecordId } from '../visitor/visitor-identity.js';

export function readSessionId(value: string) {
  if (!isVisitorRecordId(value)) {
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
