import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class AccountUsage {
  private readonly usage = new Map<string, { requests: number; generations: number }>();
  private windowEnd = 0;

  check(owner: string, request: Request, response: Response) {
    const now = Date.now();
    if (now >= this.windowEnd) {
      this.usage.clear();
      this.windowEnd = now + 60_000;
    }
    const entry = this.usage.get(owner);
    const generates = request.method === 'POST'
      && /^\/api\/(chat\/?$|tarot\/interpret\/)/i.test(request.path);
    if ((entry && (entry.requests >= 90 || (generates && entry.generations >= 6)))
      || (!entry && this.usage.size >= 10_000)) {
      response.setHeader('Retry-After', Math.ceil((this.windowEnd - now) / 1000));
      throw new HttpException({ error: 'account_rate_limited' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    const current = entry ?? { requests: 0, generations: 0 };
    current.requests++;
    if (generates) current.generations++;
    this.usage.set(owner, current);
  }
}
