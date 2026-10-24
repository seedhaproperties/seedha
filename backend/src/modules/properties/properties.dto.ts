import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingTypeEnum } from '../../common/constants.js';

export class CreatePropertyDto {
  @ApiProperty({ example: 'My 3 BHK Flat in Kondapur' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Spacious apartment near metro station' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ListingTypeEnum, example: ListingTypeEnum.BUY })
  @IsEnum(ListingTypeEnum)
  listingType!: ListingTypeEnum;

  @ApiProperty({ example: 'apartment' })
  @IsString()
  @IsNotEmpty()
  propertyType!: string;

  @ApiProperty({ example: 12500000 })
  @IsNumber()
  price!: number;

  @ApiPropertyOptional({ example: '₹1.25 Cr' })
  @IsOptional()
  @IsString()
  priceLabel?: string;

  @ApiProperty({ example: 'Kondapur, Hitec City Road' })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({ example: 'Hyderabad' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 1650 })
  @IsNumber()
  area!: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional({ example: 'semi-furnished' })
  @IsOptional()
  @IsString()
  furnishing?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  deposit?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsOptional()
  @IsNumber()
  maintenance?: number;

  @ApiPropertyOptional({ example: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ example: ['Power Backup', 'Lift', 'Security'] })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  ownerPhone!: string;
}

export class QueryPropertyDto {
  @ApiPropertyOptional({ enum: ListingTypeEnum })
  @IsOptional()
  type?: ListingTypeEnum;

  @ApiPropertyOptional({ example: 'Hyderabad' })
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Madhapur' })
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 50000000 })
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  bhk?: number;

  @ApiPropertyOptional({ example: 'apartment' })
  @IsOptional()
  propertyType?: string;
}
