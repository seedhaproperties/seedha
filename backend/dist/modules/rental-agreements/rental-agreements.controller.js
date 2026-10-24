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
import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RentalAgreementsService } from './rental-agreements.service.js';
import { RentalAgreementDetailsDto } from './rental-agreements.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
let RentalAgreementsController = class RentalAgreementsController {
    rentalAgreementsService;
    constructor(rentalAgreementsService) {
        this.rentalAgreementsService = rentalAgreementsService;
    }
    previewAgreement(dto) {
        return this.rentalAgreementsService.generateAgreementPreview(dto);
    }
    async orderAgreement(payload, req) {
        return this.rentalAgreementsService.createAndOrderAgreement(payload.details, payload.payment, req.user?.sub);
    }
    async getMyAgreements(req) {
        return this.rentalAgreementsService.getMyAgreements(req.user?.sub || '+919876543210');
    }
    async getAgreementById(id) {
        return this.rentalAgreementsService.findOne(id);
    }
};
__decorate([
    Post('preview'),
    ApiOperation({ summary: 'Submit details and generate legal agreement preview (Diagram 1 Flow F)' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RentalAgreementDetailsDto]),
    __metadata("design:returntype", void 0)
], RentalAgreementsController.prototype, "previewAgreement", null);
__decorate([
    Post('order'),
    ApiOperation({ summary: 'Pay money and order agreement (Diagram 1 Flow F)' }),
    ApiResponse({ status: 201, description: 'Order placed, moves to Admin for preparation' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RentalAgreementsController.prototype, "orderAgreement", null);
__decorate([
    Get('my'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user ordered rental agreements' }),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RentalAgreementsController.prototype, "getMyAgreements", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get agreement details and download URL' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RentalAgreementsController.prototype, "getAgreementById", null);
RentalAgreementsController = __decorate([
    ApiTags('Rental Agreements'),
    Controller('api/v1/rental-agreements'),
    __metadata("design:paramtypes", [RentalAgreementsService])
], RentalAgreementsController);
export { RentalAgreementsController };
//# sourceMappingURL=rental-agreements.controller.js.map