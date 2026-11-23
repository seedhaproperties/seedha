import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CalculateLoanDto {
  @ApiProperty({ example: 5000000, description: 'Loan amount in Rupees' })
  @IsNumber()
  @Min(100000)
  loanAmount!: number;

  @ApiProperty({ example: 8.4, description: 'Annual interest rate percentage' })
  @IsNumber()
  interestRate!: number;

  @ApiProperty({ example: 20, description: 'Tenure in years' })
  @IsNumber()
  @Min(1)
  tenureYears!: number;

  @ApiPropertyOptional({ example: 120000, description: 'Monthly in-hand income' })
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @ApiPropertyOptional({ example: 15000, description: 'Existing active monthly EMIs' })
  @IsOptional()
  @IsNumber()
  existingEmi?: number;
}

export class LoanAssistanceRequestDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  userPhone!: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiProperty({ example: 'Home Purchase Loan' })
  @IsString()
  @IsNotEmpty()
  loanType!: string;

  @ApiProperty({ example: 7500000 })
  @IsNumber()
  propertyCost!: number;

  @ApiProperty({ example: 6000000 })
  @IsNumber()
  loanAmount!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  tenureYears!: number;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  monthlyIncome!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  existingEmi?: number;

  @ApiProperty({ example: 51691 })
  @IsNumber()
  calculatedEmi!: number;

  @ApiPropertyOptional({ example: 'HDFC Bank Home Loans' })
  @IsOptional()
  @IsString()
  selectedBank?: string;
}

export class CreateBankLoanOfferDto {
  @ApiProperty({ example: 'State Bank of India (SBI)' })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ example: 'sbi' })
  @IsString()
  @IsNotEmpty()
  bankCode!: string;

  @ApiProperty({ example: 8.40 })
  @IsNumber()
  interestRateMin!: number;

  @ApiPropertyOptional({ example: 9.05 })
  @IsOptional()
  @IsNumber()
  interestRateMax?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  minLoanAmount?: number;

  @ApiPropertyOptional({ example: 150000000 })
  @IsOptional()
  @IsNumber()
  maxLoanAmount?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  minTenureYears?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  maxTenureYears?: number;

  @ApiProperty({ example: 'Nil (Special campaign offer)' })
  @IsString()
  @IsNotEmpty()
  processingFee!: string;

  @ApiPropertyOptional({ example: 0.35 })
  @IsOptional()
  @IsNumber()
  processingFeePercent?: number;

  @ApiPropertyOptional({ example: 90.0 })
  @IsOptional()
  @IsNumber()
  maxLtvRatio?: number;

  @ApiPropertyOptional({ example: 'Lowest Rate' })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({ example: 'Daily reducing balance calculation, 0.05% concession for women borrowers.' })
  @IsOptional()
  @IsString()
  highlights?: string;

  @ApiPropertyOptional({ example: 'Valid through 31 Dec 2026' })
  @IsOptional()
  @IsString()
  rateValidityDate?: string;

  @ApiPropertyOptional({ example: '23 Nov 2026' })
  @IsOptional()
  @IsString()
  lastUpdatedDate?: string;

  @ApiPropertyOptional({ example: 'sbi' })
  @IsOptional()
  @IsString()
  iconType?: string;

  @ApiPropertyOptional({ example: '#E0F2FE' })
  @IsOptional()
  @IsString()
  iconBg?: string;

  @ApiPropertyOptional({ example: '#0284C7' })
  @IsOptional()
  @IsString()
  iconColor?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateBankLoanOfferDto extends PartialType(CreateBankLoanOfferDto) {}
