import { BadRequestException } from '@nestjs/common';
import { isObject } from '../chat/chat-input.js';
import { readEmail, readProfile } from '../profile/profile-input.js';

function readPassword(password: unknown, minimum: number) {
  if (typeof password !== 'string' || Array.from(password).length < minimum || password.length > 128) {
    throw new BadRequestException({ error: 'invalid_auth_request' });
  }
  return password;
}

export function readRegistration(body: unknown) {
  if (!isObject(body)) throw new BadRequestException({ error: 'invalid_auth_request' });
  const profile = readProfile(body);
  const password = readPassword(body.password, 15);
  return { ...profile, email: profile.email.toLowerCase(), password };
}

export function readCredentials(body: unknown) {
  if (!isObject(body)) throw new BadRequestException({ error: 'invalid_auth_request' });
  return { email: readEmail(body.email).toLowerCase(), password: readPassword(body.password, 1) };
}
