import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentOrderDto {
  @ApiProperty({ example: 799 })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ example: 'OWNER_VERIFICATION', description: 'OWNER_VERIFICATION | RENTAL_AGREEMENT | PROPERTY_VISIT | BOOKING_TOKEN' })
  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @ApiPropertyOptional({ example: 'prop-buy-1' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ example: 'UPI' })
  @IsOptional()
  @IsString()
  gatewayMethod?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'ORDER_12345' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 'TXN_SEEDHA_12345' })
  @IsString()
  @IsNotEmpty()
  paymentTxnId!: string;

  @ApiPropertyOptional({ example: 'razorpay_signature' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiProperty({ example: 799 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'OWNER_VERIFICATION' })
  @IsString()
  purpose!: string;

  @ApiPropertyOptional({ example: 'prop-buy-1' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  customerName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  customerPhone!: string;

  @ApiPropertyOptional({ example: 'UPI' })
  @IsOptional()
  @IsString()
  gatewayMethod?: string;
}
