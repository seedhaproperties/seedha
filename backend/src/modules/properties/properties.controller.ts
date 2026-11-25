import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Properties')
@Controller(['api/v1/properties', 'properties'])
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) { }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get location suggestions including city, locality, and pincode' })
  async getSuggestions(@Query('query') query: string) {
    return this.propertiesService.getLocationSuggestions(query || '');
  }

  @Get('my/saved')
  @ApiOperation({ summary: 'Get all saved/liked properties for the user' })
  async getMySaved(@Request() req: any) {
    const userId = req.user?.sub || req.headers?.['x-user-id'] || 'user_guest_default';
    return this.propertiesService.getMySaved(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter published properties with distance and radius' })
  async findAll(
    @Query() query: QueryPropertyDto,
    @Query('userId') userId?: string,
    @Query('ownerOnly') ownerOnly?: string,
  ) {
    if (ownerOnly === 'true') {
      return this.propertiesService.findUserProperties(userId);
    }
    return this.propertiesService.findAll(query);
  }

  @Get('user/my-properties')
  @ApiOperation({ summary: 'Get current user submitted and owned properties' })
  async getMyProperties(@Request() req: any, @Query('userId') queryUserId?: string) {
    let sub = req.user?.sub;
    const authHeader = req.headers?.authorization;
    if (!sub && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
        sub = decoded?.sub || decoded?.id;
      } catch { }
    }
    return this.propertiesService.findUserProperties(sub || queryUserId);
  }

  @Get('my-properties')
  @ApiOperation({ summary: 'Alias: Get current user submitted and owned properties' })
  async getMyPropertiesAlias(@Request() req: any, @Query('userId') queryUserId?: string) {
    return this.getMyProperties(req, queryUserId);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload property listing photo to Cloudinary' })
  async uploadImage(@Body() dto: UploadPropertyImageDto) {
    return this.propertiesService.uploadImage(dto);
  }

  @Delete(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property image from Cloudinary' })
  async deletePropertyImage(
    @Param('id') id: string,
    @Query('publicId') publicId?: string,
    @Body('publicId') bodyPublicId?: string,
  ) {
    const targetPublicId = publicId || bodyPublicId;
    if (!targetPublicId) {
      throw new BadRequestException('publicId must be provided in query or body');
    }
    return this.propertiesService.deletePropertyImage(id, targetPublicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View property details' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Get(':id/owner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get owner details for a property' })
  async getOwnerDetails(@Param('id') id: string) {
    return this.propertiesService.getOwnerDetails(id);
  }

  @Post(':id/toggle-save')
  @ApiOperation({ summary: 'Toggle like/save status for a property' })
  async toggleSave(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub || req.headers?.['x-user-id'] || 'user_guest_default';
    return this.propertiesService.toggleSave(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner submits flat/building details for review and publication' })
  @ApiResponse({ status: 201, description: 'Property submitted to Admin review queue' })
  async create(@Body() dto: CreatePropertyDto, @Request() req: any) {
    return this.propertiesService.create(dto, req.user?.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete or remove owner property listing' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.propertiesService.remove(id, req.user?.sub);
  }
}

