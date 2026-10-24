import { Module } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service.js';
import { SiteVisitsController } from './site-visits.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService],
  exports: [SiteVisitsService],
})
export class SiteVisitsModule {}
