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
import { IsArray, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
export class SendMulticastNotificationDto {
    userIds;
    title;
    body;
    data;
}
__decorate([
    ApiProperty({
        example: ['c64a323a-f34a-4a27-9418-5085e6b5da49', 'b51d2012-789a-4c21-8319-a1b2c3d4e5f6'],
        description: 'Array of recipient User UUIDs to receive the multicast notification',
        type: [String],
    }),
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], SendMulticastNotificationDto.prototype, "userIds", void 0);
__decorate([
    ApiProperty({
        example: 'Exclusive New Villa in Gachibowli! 🌟',
        description: 'Push notification alert title',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], SendMulticastNotificationDto.prototype, "title", void 0);
__decorate([
    ApiProperty({
        example: 'A brand new 4 BHK gated villa matching your preferences is now available.',
        description: 'Push notification alert body message',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], SendMulticastNotificationDto.prototype, "body", void 0);
__decorate([
    ApiProperty({
        example: { propertyId: 'prop_villa_09', screen: 'property_details' },
        required: false,
        description: 'Optional custom key-value payload sent to the application for deep linking',
    }),
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], SendMulticastNotificationDto.prototype, "data", void 0);
//# sourceMappingURL=send-multicast.dto.js.map