import { Module } from '@nestjs/common';
import { RentalAgreementsService } from './rental-agreements.service.js';
import { RentalAgreementsController } from './rental-agreements.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [RentalAgreementsController],
  providers: [RentalAgreementsService],
  exports: [RentalAgreementsService],
})
export class RentalAgreementsModule {}
