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
import { SiteVisitsService } from './site-visits.service.js';
import { BookVisitDto, SubmitRatingDto } from './site-visits.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
let SiteVisitsController = class SiteVisitsController {
    siteVisitsService;
    constructor(siteVisitsService) {
        this.siteVisitsService = siteVisitsService;
    }
    async bookVisit(propertyId, dto, req) {
        return this.siteVisitsService.bookVisit(propertyId, dto, req.user?.sub);
    }
    async submitRating(visitId, dto) {
        return this.siteVisitsService.submitRating(visitId, dto);
    }
    async getMyVisits(req) {
        return this.siteVisitsService.getMyVisits(req.user?.sub || '+919876543210');
    }
};
__decorate([
    Post('properties/:id/visits'),
    ApiOperation({ summary: 'Book visiting for a property (Diagram 1 outcome)' }),
    ApiResponse({ status: 201, description: 'Visiting booked with duplicate check' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, BookVisitDto, Object]),
    __metadata("design:returntype", Promise)
], SiteVisitsController.prototype, "bookVisit", null);
__decorate([
    Post('site-visits/:id/rating'),
    ApiOperation({ summary: 'Submit optional rating and review after visiting' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubmitRatingDto]),
    __metadata("design:returntype", Promise)
], SiteVisitsController.prototype, "submitRating", null);
__decorate([
    Get('site-visits/my'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user booked visits' }),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteVisitsController.prototype, "getMyVisits", null);
SiteVisitsController = __decorate([
    ApiTags('Site Visits & Ratings'),
    Controller('api/v1'),
    __metadata("design:paramtypes", [SiteVisitsService])
], SiteVisitsController);
export { SiteVisitsController };
//# sourceMappingURL=site-visits.controller.js.map