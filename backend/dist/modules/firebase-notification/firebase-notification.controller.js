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
import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard.js';
import { FirebaseNotificationService } from './firebase-notification.service.js';
import { RegisterDeviceTokenDto, UnregisterDeviceTokenDto } from './dto/register-token.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { SendMulticastNotificationDto } from './dto/send-multicast.dto.js';
import { TestNotificationDto } from './dto/test-notification.dto.js';
let FirebaseNotificationController = class FirebaseNotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async checkHealth() {
        return this.notificationService.checkHealth();
    }
    async sendTestToken(dto) {
        return this.notificationService.sendTestNotification(dto.token, dto.title, dto.body, dto.data);
    }
    async registerDeviceToken(req, dto) {
        const userId = req.user?.sub || req.user?.id;
        return this.notificationService.registerDeviceToken(userId, dto.token, dto.platform);
    }
    async unregisterDeviceToken(req, dto) {
        const userId = req.user?.sub || req.user?.id;
        return this.notificationService.unregisterDeviceToken(userId, dto.token);
    }
    async getMyDevices(req) {
        const userId = req.user?.sub || req.user?.id;
        return this.notificationService.getDeviceTokensForUser(userId);
    }
    async sendToUser(dto) {
        return this.notificationService.sendToUser(dto.userId, {
            title: dto.title,
            body: dto.body,
            data: dto.data,
        });
    }
    async sendMulticast(dto) {
        return this.notificationService.sendToUsers(dto.userIds, {
            title: dto.title,
            body: dto.body,
            data: dto.data,
        });
    }
};
__decorate([
    Public(),
    Get('health'),
    ApiOperation({
        summary: 'Check live Firebase Admin SDK connection, credential validity and authentication status',
    }),
    ApiResponse({ status: 200, description: 'Firebase connection health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FirebaseNotificationController.prototype, "checkHealth", null);
__decorate([
    Post('test-token'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Send a test push notification to a specific FCM device token to verify delivery',
    }),
    ApiResponse({ status: 200, description: 'Test notification delivery result from Firebase' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TestNotificationDto]),
    __metadata("design:returntype", Promise)
], FirebaseNotificationController.prototype, "sendTestToken", null);
__decorate([
    Post('device-token'),
    ApiOperation({
        summary: 'Register or refresh an FCM device push token for the authenticated user',
    }),
    ApiResponse({ status: 201, description: 'Device token registered successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RegisterDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], FirebaseNotificationController.prototype, "registerDeviceToken", null);
__decorate([
    Post('device-token/unregister'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Unregister an FCM device token upon user logout',
    }),
    ApiResponse({ status: 200, description: 'Device token unregistered successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UnregisterDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], FirebaseNotificationController.prototype, "unregisterDeviceToken", null);
__decorate([
    Get('my-devices'),
    ApiOperation({
        summary: 'Get all active registered device tokens for the current user',
    }),
    ApiResponse({ status: 200, description: 'List of registered devices' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FirebaseNotificationController.prototype, "getMyDevices", null);
__decorate([
    Post('send-to-user'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Send an FCM push notification to all active devices of a target user',
    }),
    ApiResponse({ status: 200, description: 'Push notification delivery result' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendNotificationDto]),
    __metadata("design:returntype", Promise)
], FirebaseNotificationController.prototype, "sendToUser", null);
__decorate([
    Post('send-multicast'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Send an FCM push notification to multiple target users simultaneously',
    }),
    ApiResponse({ status: 200, description: 'Multicast push notification delivery result' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendMulticastNotificationDto]),
    __metadata("design:returntype", Promise)
], FirebaseNotificationController.prototype, "sendMulticast", null);
FirebaseNotificationController = __decorate([
    ApiTags('Notifications'),
    Controller('api/v1/notifications'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    __metadata("design:paramtypes", [FirebaseNotificationService])
], FirebaseNotificationController);
export { FirebaseNotificationController };
//# sourceMappingURL=firebase-notification.controller.js.map