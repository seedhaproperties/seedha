import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookVisitDto {
  @ApiProperty({ example: '2026-10-28' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: '10:00 AM - 11:00 AM' })
  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  userPhone!: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({ example: 'Interested in seeing east-facing balcony' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmitRatingDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Property was exactly as shown in photos! Great experience.' })
  @IsOptional()
  @IsString()
  ratingComment?: string;
}
