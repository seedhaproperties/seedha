import { Module } from '@nestjs/common';
import { HomeLoansService } from './home-loans.service.js';
import { HomeLoansController } from './home-loans.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [HomeLoansController],
  providers: [HomeLoansService],
  exports: [HomeLoansService],
})
export class HomeLoansModule {}
