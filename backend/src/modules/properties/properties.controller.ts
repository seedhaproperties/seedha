import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, QueryPropertyDto } from './properties.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Properties')
@Controller('api/v1/properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

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
  async findAll(@Query() query: QueryPropertyDto) {
    return this.propertiesService.findAll(query);
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
}

