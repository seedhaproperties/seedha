var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CalculateLoanDto {
    loanAmount;
    interestRate;
    tenureYears;
    monthlyIncome;
    existingEmi;
}
__decorate([
    ApiProperty({ example: 5000000, description: 'Loan amount in Rupees' }),
    IsNumber(),
    Min(100000),
    __metadata("design:type", Number)
], CalculateLoanDto.prototype, "loanAmount", void 0);
__decorate([
    ApiProperty({ example: 8.4, description: 'Annual interest rate percentage' }),
    IsNumber(),
    __metadata("design:type", Number)
], CalculateLoanDto.prototype, "interestRate", void 0);
__decorate([
    ApiProperty({ example: 20, description: 'Tenure in years' }),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], CalculateLoanDto.prototype, "tenureYears", void 0);
__decorate([
    ApiPropertyOptional({ example: 120000, description: 'Monthly in-hand income' }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CalculateLoanDto.prototype, "monthlyIncome", void 0);
__decorate([
    ApiPropertyOptional({ example: 15000, description: 'Existing active monthly EMIs' }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CalculateLoanDto.prototype, "existingEmi", void 0);
export class LoanAssistanceRequestDto {
    userName;
    userPhone;
    userEmail;
    loanType;
    propertyCost;
    loanAmount;
    tenureYears;
    monthlyIncome;
    existingEmi;
    calculatedEmi;
    selectedBank;
}
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "userName", void 0);
__decorate([
    ApiProperty({ example: '+919876543210' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "userPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahul@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "userEmail", void 0);
__decorate([
    ApiProperty({ example: 'Home Purchase Loan' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "loanType", void 0);
__decorate([
    ApiProperty({ example: 7500000 }),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "propertyCost", void 0);
__decorate([
    ApiProperty({ example: 6000000 }),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "loanAmount", void 0);
__decorate([
    ApiProperty({ example: 20 }),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "tenureYears", void 0);
__decorate([
    ApiProperty({ example: 150000 }),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "monthlyIncome", void 0);
__decorate([
    ApiPropertyOptional({ example: 0 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "existingEmi", void 0);
__decorate([
    ApiProperty({ example: 51691 }),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "calculatedEmi", void 0);
__decorate([
    ApiPropertyOptional({ example: 'HDFC Bank Home Loans' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "selectedBank", void 0);
//# sourceMappingURL=home-loans.dto.js.map