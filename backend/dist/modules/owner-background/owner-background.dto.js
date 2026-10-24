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
export class RequestOwnerBackgroundDto {
    flatNumber;
    buildingName;
    propertyAddress;
    city;
    ownerName;
    ownerPhone;
    propertyId;
}
__decorate([
    ApiProperty({ example: 'Flat 402, Block B' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RequestOwnerBackgroundDto.prototype, "flatNumber", void 0);
__decorate([
    ApiProperty({ example: 'Prestige High Fields' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RequestOwnerBackgroundDto.prototype, "buildingName", void 0);
__decorate([
    ApiProperty({ example: 'ISB Road, Financial District, Nanakramguda' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RequestOwnerBackgroundDto.prototype, "propertyAddress", void 0);
__decorate([
    ApiProperty({ example: 'Hyderabad' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RequestOwnerBackgroundDto.prototype, "city", void 0);
__decorate([
    ApiProperty({ example: 'Kishore Kothari' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RequestOwnerBackgroundDto.prototype, "ownerName", void 0);
__decorate([
    ApiProperty({ example: '+919885011223' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RequestOwnerBackgroundDto.prototype, "ownerPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'prop-rent-1' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RequestOwnerBackgroundDto.prototype, "propertyId", void 0);
export class PayOwnerBackgroundDto {
    paymentTxnId;
    paymentAmount;
}
__decorate([
    ApiProperty({ example: 'txn_bg_1739281203' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], PayOwnerBackgroundDto.prototype, "paymentTxnId", void 0);
__decorate([
    ApiProperty({ example: 499 }),
    IsNumber(),
    __metadata("design:type", Number)
], PayOwnerBackgroundDto.prototype, "paymentAmount", void 0);
//# sourceMappingURL=owner-background.dto.js.map