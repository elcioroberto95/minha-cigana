import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ConsultationMemory } from './application/consultation-memory.js';
import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    { provide: ConsultationMemory, inject: [ProfileService], useFactory: (repository: ProfileService) => new ConsultationMemory(repository) },
  ],
  exports: [ConsultationMemory],
})
export class ProfileModule {}
