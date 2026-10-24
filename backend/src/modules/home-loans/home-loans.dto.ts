import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
