var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class SubmitPropertyManagementDto {
    ownerName;
    ownerPhone;
    ownerEmail;
    flatDetails;
    address;
    city;
    locality;
    serviceRequested;
}
__decorate([
    ApiProperty({ example: 'Venkatesh Rao' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "ownerName", void 0);
__decorate([
    ApiProperty({ example: '+919849012345' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "ownerPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'venkatesh@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "ownerEmail", void 0);
__decorate([
    ApiProperty({ example: 'Flat 402, Block B, 3 BHK, 1850 sq.ft' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "flatDetails", void 0);
__decorate([
    ApiProperty({ example: 'Aparna CyberLife, Nallagandla' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "address", void 0);
__decorate([
    ApiProperty({ example: 'Hyderabad' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "city", void 0);
__decorate([
    ApiProperty({ example: 'Gachibowli' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "locality", void 0);
__decorate([
    ApiProperty({ example: 'Full Property Management (Tenant Finding, Rent Collection, Repairs)' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SubmitPropertyManagementDto.prototype, "serviceRequested", void 0);
//# sourceMappingURL=property-management.dto.js.map