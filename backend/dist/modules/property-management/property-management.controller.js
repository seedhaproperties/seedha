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
import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyManagementService } from './property-management.service.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
let PropertyManagementController = class PropertyManagementController {
    pmService;
    constructor(pmService) {
        this.pmService = pmService;
    }
    async submitRequest(dto, req) {
        return this.pmService.submitRequest(dto, req.user?.sub);
    }
    async getMyRequests(req) {
        return this.pmService.getMyRequests(req.user?.sub || '+919849012345');
    }
    async findOne(id) {
        return this.pmService.findOne(id);
    }
};
__decorate([
    Post('requests'),
    ApiOperation({ summary: 'Owner uploads flat details for Property Management (Diagram 1 Flow D)' }),
    ApiResponse({ status: 201, description: 'Direct to Admin for review and location check' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmitPropertyManagementDto, Object]),
    __metadata("design:returntype", Promise)
], PropertyManagementController.prototype, "submitRequest", null);
__decorate([
    Get('my'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current owner submitted management requests' }),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PropertyManagementController.prototype, "getMyRequests", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get details of a property management request' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertyManagementController.prototype, "findOne", null);
PropertyManagementController = __decorate([
    ApiTags('Property Management'),
    Controller('api/v1/property-management'),
    __metadata("design:paramtypes", [PropertyManagementService])
], PropertyManagementController);
export { PropertyManagementController };
//# sourceMappingURL=property-management.controller.js.map