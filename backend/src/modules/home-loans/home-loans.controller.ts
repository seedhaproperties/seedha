import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeLoansService } from './home-loans.service.js';
import {
  CalculateLoanDto,
  LoanAssistanceRequestDto,
  CreateBankLoanOfferDto,
  UpdateBankLoanOfferDto,
} from './home-loans.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Home Loans')
@Controller(['api/v1/home-loans', 'home-loans'])
export class HomeLoansController {
  constructor(private readonly homeLoansService: HomeLoansService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get configured loan types (Home Purchase, Construction, Plot, Balance Transfer)' })
  getLoanTypes() {
    return this.homeLoansService.getLoanTypes();
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate accurate reducing-balance EMI & indicative eligibility' })
  calculateEmi(@Body() dto: CalculateLoanDto) {
    return this.homeLoansService.calculateEmiAndEligibility(dto);
  }

  @Get(['compare-banks', 'offers'])
  @ApiOperation({ summary: 'Compare verified bank loan offerings and rates with dynamic reducing-balance EMI' })
  compareBanks(
    @Query('loanAmount') loanAmount?: number,
    @Query('tenureYears') tenureYears?: number,
  ) {
    return this.homeLoansService.getBankLoansComparison(loanAmount, tenureYears);
  }

  @Get('documents/:loanType')
  @ApiOperation({ summary: 'Show required documents for salaried and self-employed' })
  getRequiredDocuments(@Param('loanType') loanType: string) {
    return this.homeLoansService.getRequiredDocuments(loanType);
  }

  @Post('assistance')
  @ApiOperation({ summary: 'Contact Seedha Properties for Loan Assistance' })
  @ApiResponse({ status: 201, description: 'Loan assistance request submitted to admin review' })
  async requestAssistance(@Body() dto: LoanAssistanceRequestDto, @Request() req: any) {
    return this.homeLoansService.submitAssistanceRequest(dto, req.user?.sub);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user home loan requests' })
  async getMyRequests(@Request() req: any) {
    return this.homeLoansService.getMyLoanRequests(req.user?.sub || '+919876543210');
  }

  // ── Admin Endpoints for Bank Loan Offers ──

  @Get('admin/offers')
  @ApiOperation({ summary: 'Admin: Get all bank loan offers (including inactive)' })
  async getAdminOffers(@Query('includeInactive') includeInactive?: string) {
    return this.homeLoansService.getAllOffers(includeInactive !== 'false');
  }

  @Post('admin/offers')
  @ApiOperation({ summary: 'Admin: Create new bank loan offer' })
  async createAdminOffer(@Body() dto: CreateBankLoanOfferDto) {
    return this.homeLoansService.createOffer(dto);
  }

  @Put('admin/offers/:id')
  @ApiOperation({ summary: 'Admin: Update existing bank loan offer' })
  async updateAdminOffer(
    @Param('id') id: string,
    @Body() dto: UpdateBankLoanOfferDto,
  ) {
    return this.homeLoansService.updateOffer(id, dto);
  }

  @Patch('admin/offers/:id/toggle')
  @ApiOperation({ summary: 'Admin: Toggle bank loan offer active/inactive status' })
  async toggleAdminOffer(
    @Param('id') id: string,
    @Body('isActive') isActive?: boolean,
  ) {
    return this.homeLoansService.toggleOfferStatus(id, isActive);
  }

  @Delete('admin/offers/:id')
  @ApiOperation({ summary: 'Admin: Delete bank loan offer' })
  async deleteAdminOffer(@Param('id') id: string) {
    return this.homeLoansService.deleteOffer(id);
  }
}
