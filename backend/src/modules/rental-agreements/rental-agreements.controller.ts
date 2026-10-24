import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RentalAgreementsService } from './rental-agreements.service.js';
import { RentalAgreementDetailsDto, OrderAgreementDto } from './rental-agreements.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Rental Agreements')
@Controller('api/v1/rental-agreements')
export class RentalAgreementsController {
  constructor(private readonly rentalAgreementsService: RentalAgreementsService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Submit details and generate legal agreement preview (Diagram 1 Flow F)' })
  previewAgreement(@Body() dto: RentalAgreementDetailsDto) {
    return this.rentalAgreementsService.generateAgreementPreview(dto);
  }

  @Post('order')
  @ApiOperation({ summary: 'Pay money and order agreement (Diagram 1 Flow F)' })
  @ApiResponse({ status: 201, description: 'Order placed, moves to Admin for preparation' })
  async orderAgreement(
    @Body() payload: { details: RentalAgreementDetailsDto; payment: OrderAgreementDto },
    @Request() req: any,
  ) {
    return this.rentalAgreementsService.createAndOrderAgreement(
      payload.details,
      payload.payment,
      req.user?.sub,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user ordered rental agreements' })
  async getMyAgreements(@Request() req: any) {
    return this.rentalAgreementsService.getMyAgreements(req.user?.sub || '+919876543210');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agreement details and download URL' })
  async getAgreementById(@Param('id') id: string) {
    return this.rentalAgreementsService.findOne(id);
  }
}
