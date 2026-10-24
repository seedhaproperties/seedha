import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RentalAgreementDetailsDto {
  @ApiProperty({ example: 'Suresh Chandra' })
  @IsString()
  @IsNotEmpty()
  landlordName!: string;

  @ApiProperty({ example: '+919849098765' })
  @IsString()
  @IsNotEmpty()
  landlordPhone!: string;

  @ApiPropertyOptional({ example: 'suresh@example.com' })
  @IsOptional()
  @IsString()
  landlordEmail?: string;

  @ApiProperty({ example: 'Plot 45, Jubilee Hills, Hyderabad' })
  @IsString()
  @IsNotEmpty()
  landlordAddress!: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  tenantName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  tenantPhone!: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsString()
  tenantEmail?: string;

  @ApiProperty({ example: 'Flat 301, Fortune Heights, Madhapur, Hyderabad' })
  @IsString()
  @IsNotEmpty()
  tenantAddress!: string;

  @ApiProperty({ example: 'Flat 301, Fortune Heights, Madhapur, Hyderabad - 500081' })
  @IsString()
  @IsNotEmpty()
  propertyAddress!: string;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  monthlyRent!: number;

  @ApiProperty({ example: 105000 })
  @IsNumber()
  securityDeposit!: number;

  @ApiProperty({ example: 11 })
  @IsNumber()
  leaseTermMonths!: number;

  @ApiProperty({ example: '2026-11-01' })
  @IsString()
  @IsNotEmpty()
  agreementStartDate!: string;
}

export class OrderAgreementDto {
  @ApiProperty({ example: 'txn_rent_1739281203' })
  @IsString()
  @IsNotEmpty()
  paymentTxnId!: string;

  @ApiProperty({ example: 999 })
  @IsNumber()
  paymentAmount!: number;
}
