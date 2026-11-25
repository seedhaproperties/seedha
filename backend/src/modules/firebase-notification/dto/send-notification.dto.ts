import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    example: 'c64a323a-f34a-4a27-9418-5085e6b5da49',
    description: 'Target User UUID in Seedha Properties PostgreSQL database',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    example: 'Site Visit Confirmed! 🏡',
    description: 'Push notification alert title',
  })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Your site visit for Rainbow Vistas has been scheduled for tomorrow at 11:00 AM.',
    description: 'Push notification alert body message',
  })
  @IsNotEmpty()
  @IsString()
  body!: string;

  @ApiProperty({
    example: { propertyId: 'prop_123', screen: 'site_visit_details' },
    required: false,
    description: 'Optional custom key-value payload sent to the application for deep linking',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
