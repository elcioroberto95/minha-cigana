import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthRateGuard } from './auth-rate.guard.js';
import { AuthService } from './auth.service.js';
import { IdentityGuard } from './identity.guard.js';

@Module({ controllers: [AuthController], providers: [AuthService, AuthRateGuard, IdentityGuard], exports: [AuthService, IdentityGuard] })
export class AuthModule {}
