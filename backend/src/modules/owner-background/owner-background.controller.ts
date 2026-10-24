import { Controller, Post, Get, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { OwnerBackgroundService } from './owner-background.service.js';
import { RequestOwnerBackgroundDto, PayOwnerBackgroundDto } from './owner-background.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Owner Background Verification')
@Controller('api/v1/owner-background')
export class OwnerBackgroundController {
  constructor(private readonly ownerBgService: OwnerBackgroundService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate Owner Background Verification (Diagram 1 Flow B & Flow G)' })
  @ApiResponse({ status: 201, description: 'Request created, pending payment of ₹499' })
  async createRequest(
    @Body() dto: RequestOwnerBackgroundDto,
    @Request() req: any,
  ) {
    return this.ownerBgService.createRequest(dto, req.user?.sub);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay money for owner background report (Diagram 1 Flow B & Flow G)' })
  async payAndGenerate(
    @Param('id') id: string,
    @Body() dto: PayOwnerBackgroundDto,
  ) {
    return this.ownerBgService.payAndSubmit(id, dto);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Receive owner background details digitally (Diagram 1 & 2 Flow G)' })
  async getReport(@Param('id') id: string) {
    return this.ownerBgService.getReport(id);
  }

  @Get(':id/report-pdf')
  @ApiOperation({ summary: 'Download verified Owner Background PDF report' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const report = await this.ownerBgService.getReport(id);
    const pdfDummyContent = `
%PDF-1.4
% SEEDHA PROPERTIES - VERIFIED OWNER BACKGROUND REPORT
Owner Name: ${report.ownerName}
Property: Flat ${report.flatNumber}, ${report.buildingName}, ${report.city}
Ownership Status: ${report.verificationChecklist.ownershipTitleDeed}
Legal Clearances: ${report.verificationChecklist.encumbranceCertificateEC}
Municipal Property Tax: ${report.verificationChecklist.municipalTaxReceipts}
Society Dues: ${report.verificationChecklist.societyMaintenanceDues}
Summary: ${report.reportSummary}
Verified by Seedha Properties Verification Cell
    `.trim();

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Seedha_Owner_Verification_${id}.txt`,
    );
    res.send(pdfDummyContent);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user background verification requests' })
  async getMyRequests(@Request() req: any) {
    return this.ownerBgService.getMyChecks(req.user?.sub || '+919876543210');
  }
}
