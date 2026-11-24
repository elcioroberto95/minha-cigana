import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthRateGuard } from './auth-rate.guard.js';
import { AuthService } from './auth.service.js';
import { IdentityGuard } from './identity.guard.js';
import { AccountUsage } from './account-usage.js';

@Module({ controllers: [AuthController], providers: [AuthService, AuthRateGuard, IdentityGuard, AccountUsage],
  exports: [AuthService, IdentityGuard, AccountUsage] })
export class AuthModule {}
