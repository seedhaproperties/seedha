import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SiteVisitsService } from './site-visits.service.js';
import { BookVisitDto, SubmitRatingDto } from './site-visits.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Site Visits & Ratings')
@Controller('api/v1')
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Post('properties/:id/visits')
  @ApiOperation({ summary: 'Book visiting for a property (Diagram 1 outcome)' })
  @ApiResponse({ status: 201, description: 'Visiting booked with duplicate check' })
  async bookVisit(
    @Param('id') propertyId: string,
    @Body() dto: BookVisitDto,
    @Request() req: any,
  ) {
    return this.siteVisitsService.bookVisit(propertyId, dto, req.user?.sub);
  }

  @Post('site-visits/:id/rating')
  @ApiOperation({ summary: 'Submit optional rating and review after visiting' })
  async submitRating(
    @Param('id') visitId: string,
    @Body() dto: SubmitRatingDto,
  ) {
    return this.siteVisitsService.submitRating(visitId, dto);
  }

  @Get('site-visits/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user booked visits' })
  async getMyVisits(@Request() req: any) {
    return this.siteVisitsService.getMyVisits(req.user?.sub || '+919876543210');
  }
}
