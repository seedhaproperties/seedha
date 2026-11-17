import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FirebaseNotificationService } from './firebase-notification.service.js';
import { FirebaseNotificationController } from './firebase-notification.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [FirebaseNotificationController],
  providers: [FirebaseNotificationService],
  exports: [FirebaseNotificationService],
})
export class FirebaseNotificationModule {}
