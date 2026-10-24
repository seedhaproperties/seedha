import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyManagementService } from './property-management.service.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Property Management')
@Controller('api/v1/property-management')
export class PropertyManagementController {
  constructor(private readonly pmService: PropertyManagementService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Owner uploads flat details for Property Management (Diagram 1 Flow D)' })
  @ApiResponse({ status: 201, description: 'Direct to Admin for review and location check' })
  async submitRequest(@Body() dto: SubmitPropertyManagementDto, @Request() req: any) {
    return this.pmService.submitRequest(dto, req.user?.sub);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current owner submitted management requests' })
  async getMyRequests(@Request() req: any) {
    return this.pmService.getMyRequests(req.user?.sub || '+919849012345');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a property management request' })
  async findOne(@Param('id') id: string) {
    return this.pmService.findOne(id);
  }
}
