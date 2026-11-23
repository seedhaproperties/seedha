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
import { Controller, Post, Delete, Body, Query, BadRequestException, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service.js';
import { UploadImageDto, UploadMultipleImagesDto, DeleteImageDto, } from './cloudinary.dto.js';
let CloudinaryController = class CloudinaryController {
    cloudinaryService;
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    async uploadImage(dto) {
        const rawImage = dto.imageBase64 || dto.imageUrl;
        if (!rawImage) {
            throw new BadRequestException('imageBase64 or imageUrl must be provided');
        }
        const result = await this.cloudinaryService.uploadImage(rawImage, dto.folder);
        return {
            success: true,
            message: 'Image uploaded to Cloudinary successfully',
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
        };
    }
    async uploadMultipleImages(dto) {
        if (!dto.images || !Array.isArray(dto.images) || dto.images.length === 0) {
            throw new BadRequestException('Images array cannot be empty');
        }
        const results = await this.cloudinaryService.uploadMultipleImages(dto.images, dto.folder);
        return {
            success: true,
            count: results.length,
            images: results,
            urls: results.map((r) => r.url),
            publicIds: results.map((r) => r.publicId),
        };
    }
    async deleteImage(dto, queryPublicId) {
        const publicId = dto?.publicId || queryPublicId;
        if (!publicId) {
            throw new BadRequestException('publicId must be provided in body or query');
        }
        return this.cloudinaryService.deleteImage(publicId);
    }
};
__decorate([
    Post('image'),
    ApiOperation({
        summary: 'Upload a single property or user image to Cloudinary',
    }),
    ApiResponse({ status: 201, description: 'Image uploaded successfully' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UploadImageDto]),
    __metadata("design:returntype", Promise)
], CloudinaryController.prototype, "uploadImage", null);
__decorate([
    Post('images'),
    ApiOperation({
        summary: 'Upload multiple property images to Cloudinary in parallel',
    }),
    ApiResponse({
        status: 201,
        description: 'Multiple images uploaded successfully',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UploadMultipleImagesDto]),
    __metadata("design:returntype", Promise)
], CloudinaryController.prototype, "uploadMultipleImages", null);
__decorate([
    Delete('image'),
    ApiOperation({ summary: 'Delete an image from Cloudinary by public ID' }),
    ApiResponse({ status: 200, description: 'Image deleted from Cloudinary' }),
    __param(0, Body()),
    __param(1, Query('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DeleteImageDto, String]),
    __metadata("design:returntype", Promise)
], CloudinaryController.prototype, "deleteImage", null);
CloudinaryController = __decorate([
    ApiTags('Uploads & Cloudinary'),
    Controller(['api/v1/uploads', 'uploads']),
    __metadata("design:paramtypes", [CloudinaryService])
], CloudinaryController);
export { CloudinaryController };
//# sourceMappingURL=cloudinary.controller.js.map