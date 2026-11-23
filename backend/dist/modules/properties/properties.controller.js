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
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, BadRequestException, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
let PropertiesController = class PropertiesController {
    propertiesService;
    constructor(propertiesService) {
        this.propertiesService = propertiesService;
    }
    async findAll(query, userId, ownerOnly) {
        if (ownerOnly === 'true') {
            return this.propertiesService.findUserProperties(userId);
        }
        return this.propertiesService.findAll(query);
    }
    async getMyProperties(req, queryUserId) {
        let sub = req.user?.sub;
        const authHeader = req.headers?.authorization;
        if (!sub && authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
                sub = decoded?.sub || decoded?.id;
            }
            catch { }
        }
        return this.propertiesService.findUserProperties(sub || queryUserId);
    }
    async getMyPropertiesAlias(req, queryUserId) {
        return this.getMyProperties(req, queryUserId);
    }
    async uploadImage(dto) {
        return this.propertiesService.uploadImage(dto);
    }
    async deletePropertyImage(id, publicId, bodyPublicId) {
        const targetPublicId = publicId || bodyPublicId;
        if (!targetPublicId) {
            throw new BadRequestException('publicId must be provided in query or body');
        }
        return this.propertiesService.deletePropertyImage(id, targetPublicId);
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
    async remove(id, req) {
        return this.propertiesService.remove(id, req.user?.sub);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Search and filter published properties (Buy, Rent, Commercial)' }),
    __param(0, Query()),
    __param(1, Query('userId')),
    __param(2, Query('ownerOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryPropertyDto, String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findAll", null);
__decorate([
    Get('user/my-properties'),
    ApiOperation({ summary: 'Get current user submitted and owned properties' }),
    __param(0, Request()),
    __param(1, Query('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getMyProperties", null);
__decorate([
    Get('my-properties'),
    ApiOperation({ summary: 'Alias: Get current user submitted and owned properties' }),
    __param(0, Request()),
    __param(1, Query('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getMyPropertiesAlias", null);
__decorate([
    Post('upload-image'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Upload property listing photo to Cloudinary' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UploadPropertyImageDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "uploadImage", null);
__decorate([
    Delete(':id/images'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete a property image from Cloudinary' }),
    __param(0, Param('id')),
    __param(1, Query('publicId')),
    __param(2, Body('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "deletePropertyImage", null);
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
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
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
__decorate([
    Delete(':id'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete or remove owner property listing' }),
    __param(0, Param('id')),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "remove", null);
PropertiesController = __decorate([
    ApiTags('Properties'),
    Controller(['api/v1/properties', 'properties']),
    __metadata("design:paramtypes", [PropertiesService])
], PropertiesController);
export { PropertiesController };
//# sourceMappingURL=properties.controller.js.map