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
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeLoansService } from './home-loans.service.js';
import { CalculateLoanDto, LoanAssistanceRequestDto, CreateBankLoanOfferDto, UpdateBankLoanOfferDto, } from './home-loans.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
let HomeLoansController = class HomeLoansController {
    homeLoansService;
    constructor(homeLoansService) {
        this.homeLoansService = homeLoansService;
    }
    getLoanTypes() {
        return this.homeLoansService.getLoanTypes();
    }
    calculateEmi(dto) {
        return this.homeLoansService.calculateEmiAndEligibility(dto);
    }
    compareBanks(loanAmount, tenureYears) {
        return this.homeLoansService.getBankLoansComparison(loanAmount, tenureYears);
    }
    getRequiredDocuments(loanType) {
        return this.homeLoansService.getRequiredDocuments(loanType);
    }
    async requestAssistance(dto, req) {
        return this.homeLoansService.submitAssistanceRequest(dto, req.user?.sub);
    }
    async getMyRequests(req) {
        return this.homeLoansService.getMyLoanRequests(req.user?.sub || '+919876543210');
    }
    async getAdminOffers(includeInactive) {
        return this.homeLoansService.getAllOffers(includeInactive !== 'false');
    }
    async createAdminOffer(dto) {
        return this.homeLoansService.createOffer(dto);
    }
    async updateAdminOffer(id, dto) {
        return this.homeLoansService.updateOffer(id, dto);
    }
    async toggleAdminOffer(id, isActive) {
        return this.homeLoansService.toggleOfferStatus(id, isActive);
    }
    async deleteAdminOffer(id) {
        return this.homeLoansService.deleteOffer(id);
    }
};
__decorate([
    Get('types'),
    ApiOperation({ summary: 'Get configured loan types (Home Purchase, Construction, Plot, Balance Transfer)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomeLoansController.prototype, "getLoanTypes", null);
__decorate([
    Post('calculate'),
    ApiOperation({ summary: 'Calculate accurate reducing-balance EMI & indicative eligibility' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CalculateLoanDto]),
    __metadata("design:returntype", void 0)
], HomeLoansController.prototype, "calculateEmi", null);
__decorate([
    Get(['compare-banks', 'offers']),
    ApiOperation({ summary: 'Compare verified bank loan offerings and rates with dynamic reducing-balance EMI' }),
    __param(0, Query('loanAmount')),
    __param(1, Query('tenureYears')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], HomeLoansController.prototype, "compareBanks", null);
__decorate([
    Get('documents/:loanType'),
    ApiOperation({ summary: 'Show required documents for salaried and self-employed' }),
    __param(0, Param('loanType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HomeLoansController.prototype, "getRequiredDocuments", null);
__decorate([
    Post('assistance'),
    ApiOperation({ summary: 'Contact Seedha Properties for Loan Assistance' }),
    ApiResponse({ status: 201, description: 'Loan assistance request submitted to admin review' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoanAssistanceRequestDto, Object]),
    __metadata("design:returntype", Promise)
], HomeLoansController.prototype, "requestAssistance", null);
__decorate([
    Get('my'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user home loan requests' }),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HomeLoansController.prototype, "getMyRequests", null);
__decorate([
    Get('admin/offers'),
    ApiOperation({ summary: 'Admin: Get all bank loan offers (including inactive)' }),
    __param(0, Query('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HomeLoansController.prototype, "getAdminOffers", null);
__decorate([
    Post('admin/offers'),
    ApiOperation({ summary: 'Admin: Create new bank loan offer' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBankLoanOfferDto]),
    __metadata("design:returntype", Promise)
], HomeLoansController.prototype, "createAdminOffer", null);
__decorate([
    Put('admin/offers/:id'),
    ApiOperation({ summary: 'Admin: Update existing bank loan offer' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateBankLoanOfferDto]),
    __metadata("design:returntype", Promise)
], HomeLoansController.prototype, "updateAdminOffer", null);
__decorate([
    Patch('admin/offers/:id/toggle'),
    ApiOperation({ summary: 'Admin: Toggle bank loan offer active/inactive status' }),
    __param(0, Param('id')),
    __param(1, Body('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], HomeLoansController.prototype, "toggleAdminOffer", null);
__decorate([
    Delete('admin/offers/:id'),
    ApiOperation({ summary: 'Admin: Delete bank loan offer' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HomeLoansController.prototype, "deleteAdminOffer", null);
HomeLoansController = __decorate([
    ApiTags('Home Loans'),
    Controller(['api/v1/home-loans', 'home-loans']),
    __metadata("design:paramtypes", [HomeLoansService])
], HomeLoansController);
export { HomeLoansController };
//# sourceMappingURL=home-loans.controller.js.map