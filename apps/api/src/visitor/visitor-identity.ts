import { createHash } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

export function isVisitorRecordId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value);
}

export function ownerHash(authorization: string | undefined) {
  const token = /^Bearer ([a-f0-9]{64})$/.exec(authorization ?? '')?.[1];
  if (!token) throw new UnauthorizedException({ error: 'visitor_required' });
  return createHash('sha256').update(token).digest('hex');
}
