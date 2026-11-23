var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Post, Get, Body, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './payments.dto.js';
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    createOrder(dto, req) {
        return this.paymentsService.createOrder(dto, req.user?.sub);
    }
    verifyPayment(dto, req) {
        return this.paymentsService.verifyPayment(dto, req.user?.sub);
    }
    getMyTransactions(phone, req) {
        return this.paymentsService.getMyTransactions(req?.user?.sub, phone);
    }
    getAllTransactions() {
        return this.paymentsService.getAllTransactions();
    }
    getTerms() {
        return this.paymentsService.getTermsAndConditions();
    }
};
__decorate([
    Post('create-order'),
    ApiOperation({ summary: 'Create a payment gateway order (UPI, Cards, NetBanking, Simulation)' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePaymentOrderDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createOrder", null);
__decorate([
    Post('verify'),
    ApiOperation({ summary: 'Verify payment and record transaction in database' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    Get('my'),
    ApiOperation({ summary: 'Get current user payment transaction history and receipts' }),
    __param(0, Query('phone')),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMyTransactions", null);
__decorate([
    Get('all'),
    ApiOperation({ summary: 'Get all platform transactions (Admin / Management View)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getAllTransactions", null);
__decorate([
    Get('terms-and-conditions'),
    ApiOperation({ summary: 'Get Payment Gateway Terms and Conditions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getTerms", null);
PaymentsController = __decorate([
    ApiTags('Payments & Transactions'),
    Controller('api/v1/payments'),
    __metadata("design:paramtypes", [PaymentsService])
], PaymentsController);
export { PaymentsController };
//# sourceMappingURL=payments.controller.js.map