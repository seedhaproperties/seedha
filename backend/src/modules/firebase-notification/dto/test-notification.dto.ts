import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class TestNotificationDto {
  @ApiProperty({
    example: 'dK8Z3J..._fcm_device_token_here',
    description: 'FCM device token to send the test notification to',
  })
  @IsNotEmpty()
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'Seedha Properties Test Notification 🔔',
    required: false,
    description: 'Notification title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'This is a test notification from Seedha Properties Firebase Admin SDK.',
    required: false,
    description: 'Notification body message',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({
    example: { test: 'true', timestamp: '2026-11-16T20:20:00Z' },
    required: false,
    description: 'Optional custom key-value payload data',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
