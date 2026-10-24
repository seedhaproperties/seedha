import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeLoansService } from './home-loans.service.js';
import { CalculateLoanDto, LoanAssistanceRequestDto } from './home-loans.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Home Loans')
@Controller('api/v1/home-loans')
export class HomeLoansController {
  constructor(private readonly homeLoansService: HomeLoansService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get configured loan types (Home Purchase, Construction, Plot, Balance Transfer)' })
  getLoanTypes() {
    return this.homeLoansService.getLoanTypes();
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate accurate EMI & indicative eligibility' })
  calculateEmi(@Body() dto: CalculateLoanDto) {
    return this.homeLoansService.calculateEmiAndEligibility(dto);
  }

  @Get('compare-banks')
  @ApiOperation({ summary: 'Compare verified bank loan offerings and rates' })
  compareBanks() {
    return this.homeLoansService.getBankLoansComparison();
  }

  @Get('documents/:loanType')
  @ApiOperation({ summary: 'Show required documents for salaried and self-employed' })
  getRequiredDocuments(@Param('loanType') loanType: string) {
    return this.homeLoansService.getRequiredDocuments(loanType);
  }

  @Post('assistance')
  @ApiOperation({ summary: 'Contact Seedha Properties for Loan Assistance (Diagram 1 Flow E)' })
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
}
