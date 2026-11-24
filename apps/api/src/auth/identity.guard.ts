import { createParamDecorator, Inject, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService, type Identity } from './auth.service.js';

const identityMode = Symbol('identityMode');
type Mode = 'optional' | 'visitor' | 'account';
type IdentityRequest = Request & { identity?: Identity };

export const IdentityMode = (mode: Mode) => SetMetadata(identityMode, mode);

export const CurrentIdentity = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  context.switchToHttp().getRequest<IdentityRequest>().identity,
);

@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly auth: AuthService, @Inject(Reflector) private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<IdentityRequest>();
    const mode = this.reflector.get<Mode>(identityMode, context.getHandler());
    const authorization = request.headers.authorization;
    if (authorization === undefined && mode === 'optional') return true;
    if (authorization === undefined) throw new UnauthorizedException({ error: 'visitor_required' });
    const identity = await this.auth.identify(authorization);
    if (mode === 'account' && identity.kind !== 'account') throw new UnauthorizedException({ error: 'session_invalid' });
    if (mode === 'visitor' && identity.kind !== 'visitor') throw new UnauthorizedException({ error: 'visitor_required' });
    request.identity = identity;
    return true;
  }
}
