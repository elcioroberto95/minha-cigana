import { Body, Controller, Header, HttpCode, Post, UseGuards } from '@nestjs/common';
import { readCredentials, readRegistration } from './auth-input.js';
import { AuthRateGuard } from './auth-rate.guard.js';
import { AuthService, type Identity } from './auth.service.js';
import { CurrentIdentity, IdentityGuard, IdentityMode } from './identity.guard.js';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthRateGuard, IdentityGuard)
  @IdentityMode('visitor')
  register(@CurrentIdentity() { owner }: Identity, @Body() body: unknown) {
    return this.auth.register(owner, readRegistration(body));
  }

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthRateGuard)
  login(@Body() body: unknown) {
    return this.auth.login(readCredentials(body));
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(IdentityGuard)
  @IdentityMode('account')
  logout(@CurrentIdentity() { sessionHash }: Extract<Identity, { kind: 'account' }>) {
    return this.auth.logout(sessionHash);
  }
}
