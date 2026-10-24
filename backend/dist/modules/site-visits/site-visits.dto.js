var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class BookVisitDto {
    date;
    timeSlot;
    userName;
    userPhone;
    userEmail;
    notes;
}
__decorate([
    ApiProperty({ example: '2026-10-28' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], BookVisitDto.prototype, "date", void 0);
__decorate([
    ApiProperty({ example: '10:00 AM - 11:00 AM' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], BookVisitDto.prototype, "timeSlot", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], BookVisitDto.prototype, "userName", void 0);
__decorate([
    ApiProperty({ example: '+919876543210' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], BookVisitDto.prototype, "userPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahul@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BookVisitDto.prototype, "userEmail", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Interested in seeing east-facing balcony' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BookVisitDto.prototype, "notes", void 0);
export class SubmitRatingDto {
    rating;
    ratingComment;
}
__decorate([
    ApiProperty({ example: 5, minimum: 1, maximum: 5 }),
    IsNumber(),
    Min(1),
    Max(5),
    __metadata("design:type", Number)
], SubmitRatingDto.prototype, "rating", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Property was exactly as shown in photos! Great experience.' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SubmitRatingDto.prototype, "ratingComment", void 0);
//# sourceMappingURL=site-visits.dto.js.map