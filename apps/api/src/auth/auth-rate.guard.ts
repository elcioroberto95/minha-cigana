import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';

const windowMs = 10 * 60_000;
const maxAttempts = 20;

@Injectable()
export class AuthRateGuard implements CanActivate {
  private readonly attempts = new Map<string, number>();
  private windowEnd = 0;

  canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const now = Date.now();
    if (now >= this.windowEnd) {
      this.attempts.clear();
      this.windowEnd = now + windowMs;
    }
    const response = http.getResponse<Response>();
    const ip = response.locals.betaInviteHash as string | undefined ?? request.socket.remoteAddress ?? 'unknown';
    const count = this.attempts.get(ip) ?? 0;
    if (count >= maxAttempts || (count === 0 && this.attempts.size >= 10_000)) {
      response.setHeader('Retry-After', Math.ceil((this.windowEnd - now) / 1000));
      throw new HttpException({ error: 'auth_rate_limited' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    this.attempts.set(ip, count + 1);
    return true;
  }
}
