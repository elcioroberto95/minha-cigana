import { BadRequestException } from '@nestjs/common';
import { isObject } from '../chat/chat-input.js';

const sexes = ['female', 'male', 'other'] as const;
const moods = ['calm', 'happy', 'worried', 'sad', 'tired', 'mixed'] as const;
const topics = ['love', 'work', 'family', 'other'] as const;

function invalid(): never {
  throw new BadRequestException({ error: 'invalid_profile_request' });
}

export function readEmail(value: unknown) {
  if (typeof value !== 'string') invalid();
  const email = value.trim();
  if (email.length > 254 || /[\u0000-\u001f\u007f]/.test(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid();
  return email;
}

export function readProfile(body: unknown) {
  if (!isObject(body) || typeof body.name !== 'string') invalid();
  const name = body.name.trim();
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) invalid();
  const email = readEmail(body.email);

  const sex = sexes.find((option) => option === body.sex);
  if (!sex && body.sex != null) invalid();
  return { name, email, sex: sex ?? null };
}

export function readCheckIn(body: unknown) {
  if (!isObject(body) || typeof body.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) invalid();
  const mood = moods.find((option) => option === body.mood);
  const topic = topics.find((option) => option === body.topic);
  if (!mood || !topic) invalid();
  return { date: body.date, mood, topic };
}

export function readMemory(body: unknown) {
  if (!isObject(body) || typeof body.enabled !== 'boolean') invalid();
  return body.enabled;
}
