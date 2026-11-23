import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RentalAgreementDetailsDto {
  @ApiPropertyOptional({ example: 'Suresh Chandra' })
  @IsOptional()
  @IsString()
  landlordName?: string;

  @ApiPropertyOptional({ example: 'Suresh Chandra' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ example: '+919849098765' })
  @IsOptional()
  @IsString()
  landlordPhone?: string;

  @ApiPropertyOptional({ example: '+919849098765' })
  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @ApiPropertyOptional({ example: 'suresh@example.com' })
  @IsOptional()
  @IsString()
  landlordEmail?: string;

  @ApiPropertyOptional({ example: 'Plot 45, Jubilee Hills, Hyderabad' })
  @IsOptional()
  @IsString()
  landlordAddress?: string;

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

  @ApiPropertyOptional({ example: 'Flat 301, Fortune Heights, Madhapur, Hyderabad' })
  @IsOptional()
  @IsString()
  tenantAddress?: string;

  @ApiProperty({ example: 'Flat 301, Fortune Heights, Madhapur, Hyderabad - 500081' })
  @IsString()
  @IsNotEmpty()
  propertyAddress!: string;

  @ApiPropertyOptional({ example: 35000 })
  @IsOptional()
  @IsNumber()
  monthlyRent?: number;

  @ApiPropertyOptional({ example: 35000 })
  @IsOptional()
  @IsNumber()
  rentAmount?: number;

  @ApiPropertyOptional({ example: 105000 })
  @IsOptional()
  @IsNumber()
  securityDeposit?: number;

  @ApiPropertyOptional({ example: 105000 })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @ApiPropertyOptional({ example: 11 })
  @IsOptional()
  @IsNumber()
  leaseTermMonths?: number;

  @ApiPropertyOptional({ example: 11 })
  @IsOptional()
  @IsNumber()
  durationMonths?: number;

  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsOptional()
  @IsString()
  agreementStartDate?: string;

  @ApiPropertyOptional({ example: 'tenant' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'Standard E-Stamp' })
  @IsOptional()
  @IsString()
  stampDutyType?: string;
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
