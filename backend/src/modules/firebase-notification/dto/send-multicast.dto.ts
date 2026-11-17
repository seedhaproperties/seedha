import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class SendMulticastNotificationDto {
  @ApiProperty({
    example: ['c64a323a-f34a-4a27-9418-5085e6b5da49', 'b51d2012-789a-4c21-8319-a1b2c3d4e5f6'],
    description: 'Array of recipient User UUIDs to receive the multicast notification',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  userIds!: string[];

  @ApiProperty({
    example: 'Exclusive New Villa in Gachibowli! 🌟',
    description: 'Push notification alert title',
  })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'A brand new 4 BHK gated villa matching your preferences is now available.',
    description: 'Push notification alert body message',
  })
  @IsNotEmpty()
  @IsString()
  body!: string;

  @ApiProperty({
    example: { propertyId: 'prop_villa_09', screen: 'property_details' },
    required: false,
    description: 'Optional custom key-value payload sent to the application for deep linking',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
