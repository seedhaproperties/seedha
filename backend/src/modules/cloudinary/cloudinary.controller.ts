import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service.js';
import {
  UploadImageDto,
  UploadMultipleImagesDto,
  DeleteImageDto,
} from './cloudinary.dto.js';

@ApiTags('Uploads & Cloudinary')
@Controller(['api/v1/uploads', 'uploads'])
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @ApiOperation({
    summary: 'Upload a single property or user image to Cloudinary',
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  async uploadImage(@Body() dto: UploadImageDto) {
    const rawImage = dto.imageBase64 || dto.imageUrl;
    if (!rawImage) {
      throw new BadRequestException('imageBase64 or imageUrl must be provided');
    }

    const result = await this.cloudinaryService.uploadImage(
      rawImage,
      dto.folder,
    );

    return {
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  }

  @Post('images')
  @ApiOperation({
    summary: 'Upload multiple property images to Cloudinary in parallel',
  })
  @ApiResponse({
    status: 201,
    description: 'Multiple images uploaded successfully',
  })
  async uploadMultipleImages(@Body() dto: UploadMultipleImagesDto) {
    if (!dto.images || !Array.isArray(dto.images) || dto.images.length === 0) {
      throw new BadRequestException('Images array cannot be empty');
    }

    const results = await this.cloudinaryService.uploadMultipleImages(
      dto.images,
      dto.folder,
    );

    return {
      success: true,
      count: results.length,
      images: results,
      urls: results.map((r) => r.url),
      publicIds: results.map((r) => r.publicId),
    };
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete an image from Cloudinary by public ID' })
  @ApiResponse({ status: 200, description: 'Image deleted from Cloudinary' })
  async deleteImage(
    @Body() dto?: DeleteImageDto,
    @Query('publicId') queryPublicId?: string,
  ) {
    const publicId = dto?.publicId || queryPublicId;
    if (!publicId) {
      throw new BadRequestException('publicId must be provided in body or query');
    }
    return this.cloudinaryService.deleteImage(publicId);
  }
}
