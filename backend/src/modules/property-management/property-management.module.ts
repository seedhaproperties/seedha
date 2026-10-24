import { Module } from '@nestjs/common';
import { PropertyManagementService } from './property-management.service.js';
import { PropertyManagementController } from './property-management.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PropertyManagementController],
  providers: [PropertyManagementService],
  exports: [PropertyManagementService],
})
export class PropertyManagementModule {}
