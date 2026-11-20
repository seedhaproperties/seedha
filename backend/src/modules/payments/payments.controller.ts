import { Controller, Post, Get, Body, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './payments.dto.js';

@ApiTags('Payments & Transactions')
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a payment gateway order (UPI, Cards, NetBanking, Simulation)' })
  createOrder(@Body() dto: CreatePaymentOrderDto, @Request() req: any) {
    return this.paymentsService.createOrder(dto, req.user?.sub);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment and record transaction in database' })
  verifyPayment(@Body() dto: VerifyPaymentDto, @Request() req: any) {
    return this.paymentsService.verifyPayment(dto, req.user?.sub);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user payment transaction history and receipts' })
  getMyTransactions(@Query('phone') phone?: string, @Request() req?: any) {
    return this.paymentsService.getMyTransactions(req?.user?.sub, phone);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all platform transactions (Admin / Management View)' })
  getAllTransactions() {
    return this.paymentsService.getAllTransactions();
  }

  @Get('terms-and-conditions')
  @ApiOperation({ summary: 'Get Payment Gateway Terms and Conditions' })
  getTerms() {
    return this.paymentsService.getTermsAndConditions();
  }
}
