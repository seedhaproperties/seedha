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
export class RentalAgreementDetailsDto {
    landlordName;
    landlordPhone;
    landlordEmail;
    landlordAddress;
    tenantName;
    tenantPhone;
    tenantEmail;
    tenantAddress;
    propertyAddress;
    monthlyRent;
    securityDeposit;
    leaseTermMonths;
    agreementStartDate;
}
__decorate([
    ApiProperty({ example: 'Suresh Chandra' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "landlordName", void 0);
__decorate([
    ApiProperty({ example: '+919849098765' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "landlordPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'suresh@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "landlordEmail", void 0);
__decorate([
    ApiProperty({ example: 'Plot 45, Jubilee Hills, Hyderabad' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "landlordAddress", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "tenantName", void 0);
__decorate([
    ApiProperty({ example: '+919876543210' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "tenantPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahul@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "tenantEmail", void 0);
__decorate([
    ApiProperty({ example: 'Flat 301, Fortune Heights, Madhapur, Hyderabad' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "tenantAddress", void 0);
__decorate([
    ApiProperty({ example: 'Flat 301, Fortune Heights, Madhapur, Hyderabad - 500081' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "propertyAddress", void 0);
__decorate([
    ApiProperty({ example: 35000 }),
    IsNumber(),
    __metadata("design:type", Number)
], RentalAgreementDetailsDto.prototype, "monthlyRent", void 0);
__decorate([
    ApiProperty({ example: 105000 }),
    IsNumber(),
    __metadata("design:type", Number)
], RentalAgreementDetailsDto.prototype, "securityDeposit", void 0);
__decorate([
    ApiProperty({ example: 11 }),
    IsNumber(),
    __metadata("design:type", Number)
], RentalAgreementDetailsDto.prototype, "leaseTermMonths", void 0);
__decorate([
    ApiProperty({ example: '2026-11-01' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RentalAgreementDetailsDto.prototype, "agreementStartDate", void 0);
export class OrderAgreementDto {
    paymentTxnId;
    paymentAmount;
}
__decorate([
    ApiProperty({ example: 'txn_rent_1739281203' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], OrderAgreementDto.prototype, "paymentTxnId", void 0);
__decorate([
    ApiProperty({ example: 999 }),
    IsNumber(),
    __metadata("design:type", Number)
], OrderAgreementDto.prototype, "paymentAmount", void 0);
//# sourceMappingURL=rental-agreements.dto.js.map