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

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  senderName!: string;

  @ApiProperty({ example: 'USER', description: 'USER | OWNER | ADMIN | SYSTEM' })
  @IsString()
  @IsNotEmpty()
  senderType!: string;

  @ApiProperty({ example: 'Hi, is this property available for physical visit this Sunday?' })
  @IsString()
  @IsNotEmpty()
  text!: string;

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
