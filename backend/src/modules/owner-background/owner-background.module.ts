import { Module } from '@nestjs/common';
import { OwnerBackgroundService } from './owner-background.service.js';
import { OwnerBackgroundController } from './owner-background.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [OwnerBackgroundController],
  providers: [OwnerBackgroundService],
  exports: [OwnerBackgroundService],
})
export class OwnerBackgroundModule {}
