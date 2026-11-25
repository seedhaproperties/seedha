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
export class SendNotificationDto {
    userId;
    title;
    body;
    data;
}
__decorate([
    ApiProperty({
        example: 'c64a323a-f34a-4a27-9418-5085e6b5da49',
        description: 'Target User UUID in Seedha Properties PostgreSQL database',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "userId", void 0);
__decorate([
    ApiProperty({
        example: 'Site Visit Confirmed! 🏡',
        description: 'Push notification alert title',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "title", void 0);
__decorate([
    ApiProperty({
        example: 'Your site visit for Rainbow Vistas has been scheduled for tomorrow at 11:00 AM.',
        description: 'Push notification alert body message',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "body", void 0);
__decorate([
    ApiProperty({
        example: { propertyId: 'prop_123', screen: 'site_visit_details' },
        required: false,
        description: 'Optional custom key-value payload sent to the application for deep linking',
    }),
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], SendNotificationDto.prototype, "data", void 0);
//# sourceMappingURL=send-notification.dto.js.map