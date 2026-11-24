var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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
    applicantName;
    userPhone;
    applicantPhone;
    userEmail;
    applicantEmail;
    loanType;
    propertyCost;
    loanAmount;
    tenureYears;
    monthlyIncome;
    existingEmi;
    calculatedEmi;
    selectedBank;
    employmentType;
    propertyIdentified;
    panCard;
    aadhaarNumber;
    propertyAddress;
}
__decorate([
    ApiPropertyOptional({ example: 'Rahul Sharma' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "userName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Rahul Sharma' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "applicantName", void 0);
__decorate([
    ApiPropertyOptional({ example: '+919876543210' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "userPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: '+919876543210' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "applicantPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahul@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "userEmail", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahul@example.com' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "applicantEmail", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Home Purchase Loan' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "loanType", void 0);
__decorate([
    ApiPropertyOptional({ example: 7500000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "propertyCost", void 0);
__decorate([
    ApiPropertyOptional({ example: 6000000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "loanAmount", void 0);
__decorate([
    ApiPropertyOptional({ example: 20 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "tenureYears", void 0);
__decorate([
    ApiPropertyOptional({ example: 150000 }),
    IsOptional(),
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
    ApiPropertyOptional({ example: 51691 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], LoanAssistanceRequestDto.prototype, "calculatedEmi", void 0);
__decorate([
    ApiPropertyOptional({ example: 'State Bank of India (SBI)' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "selectedBank", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Salaried' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "employmentType", void 0);
__decorate([
    ApiPropertyOptional({ example: true }),
    IsOptional(),
    __metadata("design:type", Boolean)
], LoanAssistanceRequestDto.prototype, "propertyIdentified", void 0);
__decorate([
    ApiPropertyOptional({ example: 'ABC1234D' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "panCard", void 0);
__decorate([
    ApiPropertyOptional({ example: '123456789012' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "aadhaarNumber", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Banjara Hills, Hyderabad' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoanAssistanceRequestDto.prototype, "propertyAddress", void 0);
export class CreateBankLoanOfferDto {
    bankName;
    bankCode;
    interestRateMin;
    interestRateMax;
    minLoanAmount;
    maxLoanAmount;
    minTenureYears;
    maxTenureYears;
    processingFee;
    processingFeePercent;
    maxLtvRatio;
    badge;
    highlights;
    rateValidityDate;
    lastUpdatedDate;
    iconType;
    iconBg;
    iconColor;
    isActive;
    sortOrder;
}
__decorate([
    ApiProperty({ example: 'State Bank of India (SBI)' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "bankName", void 0);
__decorate([
    ApiProperty({ example: 'sbi' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "bankCode", void 0);
__decorate([
    ApiProperty({ example: 8.40 }),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "interestRateMin", void 0);
__decorate([
    ApiPropertyOptional({ example: 9.05 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "interestRateMax", void 0);
__decorate([
    ApiPropertyOptional({ example: 500000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "minLoanAmount", void 0);
__decorate([
    ApiPropertyOptional({ example: 150000000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "maxLoanAmount", void 0);
__decorate([
    ApiPropertyOptional({ example: 5 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "minTenureYears", void 0);
__decorate([
    ApiPropertyOptional({ example: 30 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "maxTenureYears", void 0);
__decorate([
    ApiProperty({ example: 'Nil (Special campaign offer)' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "processingFee", void 0);
__decorate([
    ApiPropertyOptional({ example: 0.35 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "processingFeePercent", void 0);
__decorate([
    ApiPropertyOptional({ example: 90.0 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "maxLtvRatio", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Lowest Rate' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "badge", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Daily reducing balance calculation, 0.05% concession for women borrowers.' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "highlights", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Valid through 31 Dec 2026' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "rateValidityDate", void 0);
__decorate([
    ApiPropertyOptional({ example: '23 Nov 2026' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "lastUpdatedDate", void 0);
__decorate([
    ApiPropertyOptional({ example: 'sbi' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "iconType", void 0);
__decorate([
    ApiPropertyOptional({ example: '#E0F2FE' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "iconBg", void 0);
__decorate([
    ApiPropertyOptional({ example: '#0284C7' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBankLoanOfferDto.prototype, "iconColor", void 0);
__decorate([
    ApiPropertyOptional({ example: true }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateBankLoanOfferDto.prototype, "isActive", void 0);
__decorate([
    ApiPropertyOptional({ example: 1 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreateBankLoanOfferDto.prototype, "sortOrder", void 0);
export class UpdateBankLoanOfferDto extends PartialType(CreateBankLoanOfferDto) {
}
//# sourceMappingURL=home-loans.dto.js.map