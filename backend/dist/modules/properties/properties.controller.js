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
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, QueryPropertyDto } from './properties.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
let PropertiesController = class PropertiesController {
    propertiesService;
    constructor(propertiesService) {
        this.propertiesService = propertiesService;
    }
    async findAll(query) {
        return this.propertiesService.findAll(query);
    }
    async findOne(id) {
        return this.propertiesService.findOne(id);
    }
    async getOwnerDetails(id) {
        return this.propertiesService.getOwnerDetails(id);
    }
    async create(dto, req) {
        return this.propertiesService.create(dto, req.user?.sub);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Search and filter published properties (Buy, Rent, Commercial)' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryPropertyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'View property details' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findOne", null);
__decorate([
    Get(':id/owner'),
    ApiOperation({ summary: 'Get owner details for a property' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getOwnerDetails", null);
__decorate([
    Post(),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Owner submits flat/building details for review and publication' }),
    ApiResponse({ status: 201, description: 'Property submitted to Admin review queue' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePropertyDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "create", null);
PropertiesController = __decorate([
    ApiTags('Properties'),
    Controller('api/v1/properties'),
    __metadata("design:paramtypes", [PropertiesService])
], PropertiesController);
export { PropertiesController };
//# sourceMappingURL=properties.controller.js.map