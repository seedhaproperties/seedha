var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
export class TestNotificationDto {
    token;
    title;
    body;
    data;
}
__decorate([
    ApiProperty({
        example: 'dK8Z3J..._fcm_device_token_here',
        description: 'FCM device token to send the test notification to',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], TestNotificationDto.prototype, "token", void 0);
__decorate([
    ApiProperty({
        example: 'Seedha Properties Test Notification 🔔',
        required: false,
        description: 'Notification title',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], TestNotificationDto.prototype, "title", void 0);
__decorate([
    ApiProperty({
        example: 'This is a test notification from Seedha Properties Firebase Admin SDK.',
        required: false,
        description: 'Notification body message',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], TestNotificationDto.prototype, "body", void 0);
__decorate([
    ApiProperty({
        example: { test: 'true', timestamp: '2026-11-16T20:20:00Z' },
        required: false,
        description: 'Optional custom key-value payload data',
    }),
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], TestNotificationDto.prototype, "data", void 0);
//# sourceMappingURL=test-notification.dto.js.map