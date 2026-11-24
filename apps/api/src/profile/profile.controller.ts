import { Body, Controller, Delete, Get, HttpCode, Post, Put, UseGuards, Header } from '@nestjs/common';
import type { Identity } from '../auth/auth.service.js';
import { CurrentIdentity, IdentityGuard } from '../auth/identity.guard.js';
import { readCheckIn, readMemory, readProfile } from './profile-input.js';
import { ProfileService } from './profile.service.js';

@Controller('api/profile')
@UseGuards(IdentityGuard)
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async profile(@CurrentIdentity() identity: Identity) {
    const { profile } = await this.profiles.profile(identity.owner);
    return { profile: profile && identity.kind === 'account' ? { ...profile, email: identity.email } : profile };
  }

  @Put()
  saveProfile(@Body() body: unknown, @CurrentIdentity() identity: Identity) {
    const profile = readProfile(body);
    return this.profiles.saveProfile(identity.owner,
      identity.kind === 'account' ? { ...profile, email: identity.email } : profile,
    );
  }

  @Get('memory')
  @Header('Cache-Control', 'no-store')
  memory(@CurrentIdentity() { owner }: Identity) {
    return this.profiles.memory(owner);
  }

  @Put('memory')
  setMemory(@Body() body: unknown, @CurrentIdentity() { owner }: Identity) {
    return this.profiles.setMemory(owner, readMemory(body));
  }

  @Post('check-in/offer')
  @HttpCode(200)
  offer(@CurrentIdentity() { owner }: Identity) {
    return this.profiles.offerToday(owner);
  }

  @Put('check-in')
  @HttpCode(204)
  saveCheckIn(@Body() body: unknown, @CurrentIdentity() { owner }: Identity) {
    return this.profiles.saveCheckIn(owner, readCheckIn(body));
  }

  @Delete('check-in')
  @HttpCode(204)
  clearCheckIns(@CurrentIdentity() { owner }: Identity) {
    return this.profiles.clearCheckIns(owner);
  }
}
