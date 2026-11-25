var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreatePaymentOrderDto {
    amount;
    purpose;
    propertyId;
    customerName;
    customerPhone;
    customerEmail;
    gatewayMethod;
}
__decorate([
    ApiProperty({ example: 799 }),
    IsNumber(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], CreatePaymentOrderDto.prototype, "amount", void 0);
__decorate([
    ApiProperty({ example: 'OWNER_VERIFICATION', description: 'OWNER_VERIFICATION | RENTAL_AGREEMENT | PROPERTY_VISIT | BOOKING_TOKEN' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "purpose", void 0);
__decorate([
    ApiPropertyOptional({ example: 'prop-buy-1' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "propertyId", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "customerName", void 0);
__decorate([
    ApiProperty({ example: '+919876543210' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "customerPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahul@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "customerEmail", void 0);
__decorate([
    ApiPropertyOptional({ example: 'UPI' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "gatewayMethod", void 0);
export class VerifyPaymentDto {
    orderId;
    paymentTxnId;
    signature;
    amount;
    purpose;
    propertyId;
    customerName;
    customerPhone;
    customerEmail;
    gatewayMethod;
}
__decorate([
    ApiProperty({ example: 'ORDER_12345' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "orderId", void 0);
__decorate([
    ApiProperty({ example: 'TXN_SEEDHA_12345' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "paymentTxnId", void 0);
__decorate([
    ApiPropertyOptional({ example: 'razorpay_signature' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "signature", void 0);
__decorate([
    ApiProperty({ example: 799 }),
    IsNumber(),
    __metadata("design:type", Number)
], VerifyPaymentDto.prototype, "amount", void 0);
__decorate([
    ApiProperty({ example: 'OWNER_VERIFICATION' }),
    IsString(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "purpose", void 0);
__decorate([
    ApiPropertyOptional({ example: 'prop-buy-1' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "propertyId", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsString(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "customerName", void 0);
__decorate([
    ApiProperty({ example: '+919876543210' }),
    IsString(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "customerPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahul@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "customerEmail", void 0);
__decorate([
    ApiPropertyOptional({ example: 'UPI' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "gatewayMethod", void 0);
//# sourceMappingURL=payments.dto.js.map