import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDeviceTokenDto {
  @ApiProperty({
    example: 'dK8Z3J..._fcm_device_token_here',
    description: 'FCM Registration Token generated on the mobile device or web client',
  })
  @IsNotEmpty()
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'android',
    enum: ['android', 'ios', 'web'],
    required: false,
    description: 'Operating system platform of the device',
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({
    example: 'usr_12345',
    required: false,
    description: 'Optional User ID if registering before or alongside JWT auth',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UnregisterDeviceTokenDto {
  @ApiProperty({
    example: 'dK8Z3J..._fcm_device_token_here',
    description: 'FCM Registration Token to be unregistered upon logout',
  })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
