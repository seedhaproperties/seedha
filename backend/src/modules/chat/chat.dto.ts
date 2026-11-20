import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendChatMessageDto {
  @ApiProperty({ example: 'prop-buy-1' })
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @ApiPropertyOptional({ example: 'Venkata Rao' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional({ example: 'USER', description: 'USER | OWNER | ADMIN | SYSTEM' })
  @IsOptional()
  @IsString()
  senderType?: string;

  @ApiPropertyOptional({ example: 'CUSTOMER', description: 'CUSTOMER | OWNER' })
  @IsOptional()
  @IsString()
  senderRole?: string;

  @ApiPropertyOptional({ example: 'Hi, is this property available for physical visit this Sunday?' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ example: 'Hi, is this property available?' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPaymentPrompt?: boolean;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  paymentAmount?: number;
}

export class ChatWebhookDto {
  @ApiProperty({ example: 'message.received' })
  @IsString()
  @IsNotEmpty()
  event!: string;

  @ApiProperty({ example: { conversationId: 'c-1', text: 'Confirmed visit' } })
  @IsNotEmpty()
  payload!: any;
}
