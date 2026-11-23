var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class SendChatMessageDto {
    propertyId;
    ownerName;
    ownerPhone;
    senderName;
    senderType;
    senderRole;
    text;
    message;
    isPaymentPrompt;
    paymentAmount;
}
__decorate([
    ApiProperty({ example: 'prop-buy-1' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "propertyId", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Venkata Rao' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "ownerName", void 0);
__decorate([
    ApiPropertyOptional({ example: '+919876543210' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "ownerPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Rahul Sharma' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "senderName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'USER', description: 'USER | OWNER | ADMIN | SYSTEM' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "senderType", void 0);
__decorate([
    ApiPropertyOptional({ example: 'CUSTOMER', description: 'CUSTOMER | OWNER' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "senderRole", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Hi, is this property available for physical visit this Sunday?' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "text", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Hi, is this property available?' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "message", void 0);
__decorate([
    ApiPropertyOptional({ example: false }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], SendChatMessageDto.prototype, "isPaymentPrompt", void 0);
__decorate([
    ApiPropertyOptional({ example: 2000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], SendChatMessageDto.prototype, "paymentAmount", void 0);
export class ChatWebhookDto {
    event;
    payload;
}
__decorate([
    ApiProperty({ example: 'message.received' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ChatWebhookDto.prototype, "event", void 0);
__decorate([
    ApiProperty({ example: { conversationId: 'c-1', text: 'Confirmed visit' } }),
    IsNotEmpty(),
    __metadata("design:type", Object)
], ChatWebhookDto.prototype, "payload", void 0);
//# sourceMappingURL=chat.dto.js.map