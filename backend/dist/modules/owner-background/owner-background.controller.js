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
import { Controller, Post, Get, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OwnerBackgroundService } from './owner-background.service.js';
import { RequestOwnerBackgroundDto, PayOwnerBackgroundDto } from './owner-background.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
let OwnerBackgroundController = class OwnerBackgroundController {
    ownerBgService;
    constructor(ownerBgService) {
        this.ownerBgService = ownerBgService;
    }
    async createRequest(dto, req) {
        return this.ownerBgService.createRequest(dto, req.user?.sub);
    }
    async payAndGenerate(id, dto) {
        return this.ownerBgService.payAndSubmit(id, dto);
    }
    async getReport(id) {
        return this.ownerBgService.getReport(id);
    }
    async downloadPdf(id, res) {
        const report = await this.ownerBgService.getReport(id);
        const pdfDummyContent = `
%PDF-1.4
% SEEDHA PROPERTIES - VERIFIED OWNER BACKGROUND REPORT
Owner Name: ${report.ownerName}
Property: Flat ${report.flatNumber}, ${report.buildingName}, ${report.city}
Ownership Status: ${report.verificationChecklist.ownershipTitleDeed}
Legal Clearances: ${report.verificationChecklist.encumbranceCertificateEC}
Municipal Property Tax: ${report.verificationChecklist.municipalTaxReceipts}
Society Dues: ${report.verificationChecklist.societyMaintenanceDues}
Summary: ${report.reportSummary}
Verified by Seedha Properties Verification Cell
    `.trim();
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=Seedha_Owner_Verification_${id}.txt`);
        res.send(pdfDummyContent);
    }
    async getMyRequests(req) {
        return this.ownerBgService.getMyChecks(req.user?.sub || '+919876543210');
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Initiate Owner Background Verification (Diagram 1 Flow B & Flow G)' }),
    ApiResponse({ status: 201, description: 'Request created, pending payment of ₹499' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestOwnerBackgroundDto, Object]),
    __metadata("design:returntype", Promise)
], OwnerBackgroundController.prototype, "createRequest", null);
__decorate([
    Post(':id/pay'),
    ApiOperation({ summary: 'Pay money for owner background report (Diagram 1 Flow B & Flow G)' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PayOwnerBackgroundDto]),
    __metadata("design:returntype", Promise)
], OwnerBackgroundController.prototype, "payAndGenerate", null);
__decorate([
    Get(':id/report'),
    ApiOperation({ summary: 'Receive owner background details digitally (Diagram 1 & 2 Flow G)' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OwnerBackgroundController.prototype, "getReport", null);
__decorate([
    Get(':id/report-pdf'),
    ApiOperation({ summary: 'Download verified Owner Background PDF report' }),
    __param(0, Param('id')),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OwnerBackgroundController.prototype, "downloadPdf", null);
__decorate([
    Get('my'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user background verification requests' }),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnerBackgroundController.prototype, "getMyRequests", null);
OwnerBackgroundController = __decorate([
    ApiTags('Owner Background Verification'),
    Controller('api/v1/owner-background'),
    __metadata("design:paramtypes", [OwnerBackgroundService])
], OwnerBackgroundController);
export { OwnerBackgroundController };
//# sourceMappingURL=owner-background.controller.js.map