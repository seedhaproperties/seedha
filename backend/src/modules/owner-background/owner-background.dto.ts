import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestOwnerBackgroundDto {
  @ApiProperty({ example: 'Flat 402, Block B' })
  @IsString()
  @IsNotEmpty()
  flatNumber!: string;

  @ApiProperty({ example: 'Prestige High Fields' })
  @IsString()
  @IsNotEmpty()
  buildingName!: string;

  @ApiProperty({ example: 'ISB Road, Financial District, Nanakramguda' })
  @IsString()
  @IsNotEmpty()
  propertyAddress!: string;

  @ApiProperty({ example: 'Hyderabad' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Kishore Kothari' })
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty({ example: '+919885011223' })
  @IsString()
  @IsNotEmpty()
  ownerPhone!: string;

  @ApiPropertyOptional({ example: 'prop-rent-1' })
  @IsOptional()
  @IsString()
  propertyId?: string;
}

export class PayOwnerBackgroundDto {
  @ApiProperty({ example: 'txn_bg_1739281203' })
  @IsString()
  @IsNotEmpty()
  paymentTxnId!: string;

  @ApiProperty({ example: 499 })
  @IsNumber()
  paymentAmount!: number;
}
