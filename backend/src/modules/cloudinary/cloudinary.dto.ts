import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiPropertyOptional({ example: 'data:image/jpeg;base64,...' })
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'seedha-properties/properties' })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class UploadMultipleImagesDto {
  @ApiProperty({ example: ['data:image/jpeg;base64,...', 'https://example.com/photo2.jpg'] })
  @IsArray()
  @IsNotEmpty()
  images!: string[];

  @ApiPropertyOptional({ example: 'seedha-properties/properties' })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class DeleteImageDto {
  @ApiProperty({ example: 'seedha-properties/properties/img_123456' })
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
