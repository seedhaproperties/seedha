var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class AssignFieldWorkDto {
    fieldAgentName;
    fieldNotes;
}
__decorate([
    ApiProperty({ example: 'Suresh Field Agent' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], AssignFieldWorkDto.prototype, "fieldAgentName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Inspect property layout, electrical fittings, and owner identity deed' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AssignFieldWorkDto.prototype, "fieldNotes", void 0);
export class RejectItemDto {
    reason;
}
__decorate([
    ApiProperty({ example: 'Location is outside current service boundary or invalid property photos.' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RejectItemDto.prototype, "reason", void 0);
export class LocationCheckDecisionDto {
    matchesLocation;
    rejectMessage;
}
__decorate([
    ApiProperty({ example: true, description: 'True if location matches serviceability rules' }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], LocationCheckDecisionDto.prototype, "matchesLocation", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Location is not yet covered in our active service zone.' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LocationCheckDecisionDto.prototype, "rejectMessage", void 0);
export class ContactOwnerDto {
    notes;
    assignedStaff;
}
__decorate([
    ApiProperty({ example: 'Called owner Mr. Rao; scheduled site onboarding for Thursday 11 AM.' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ContactOwnerDto.prototype, "notes", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Kavitha (Senior Relationship Manager)' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ContactOwnerDto.prototype, "assignedStaff", void 0);
export class PrepareAgreementDto {
    preparationNotes;
    documentUrl;
}
__decorate([
    ApiProperty({ example: 'Legal stamps affixed, e-signatures signed, final executed PDF ready.' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], PrepareAgreementDto.prototype, "preparationNotes", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://seedhaproperties.com/docs/executed_agr_17392.pdf' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], PrepareAgreementDto.prototype, "documentUrl", void 0);
export class CollectAndSendDigitalDto {
    summary;
    ownershipVerified;
    legalDisputeClear;
}
__decorate([
    ApiProperty({ example: 'All Sub-Registrar records cross-checked, GHMC tax paid, no legal stay order found.' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CollectAndSendDigitalDto.prototype, "summary", void 0);
__decorate([
    ApiProperty({ example: true }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CollectAndSendDigitalDto.prototype, "ownershipVerified", void 0);
__decorate([
    ApiProperty({ example: true }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CollectAndSendDigitalDto.prototype, "legalDisputeClear", void 0);
//# sourceMappingURL=admin.dto.js.map