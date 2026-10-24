import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import {
  AssignFieldWorkDto,
  RejectItemDto,
  LocationCheckDecisionDto,
  ContactOwnerDto,
  PrepareAgreementDto,
  CollectAndSendDigitalDto,
} from './admin.dto.js';

@ApiTags('Admin Operations & Queues (Section 2)')
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Admin overview summary with counts for all 7 review queues' })
  getOverview() {
    return this.adminService.getOverview();
  }

  // Queue 1: Flat/Building (Buy) Listings
  @Get('flats-review')
  @ApiOperation({ summary: 'Queue 1: Receive Flat/Building details' })
  getFlatsQueue() {
    return this.adminService.getFlatListingsQueue();
  }

  // Queue 2: Rent Listings
  @Get('rent-review')
  @ApiOperation({ summary: 'Queue 2: Receive Rent details' })
  getRentQueue() {
    return this.adminService.getRentListingsQueue();
  }

  // Queue 3: Commercial Listings
  @Get('commercial-review')
  @ApiOperation({ summary: 'Queue 3: Receive Commercial space details' })
  getCommercialQueue() {
    return this.adminService.getCommercialListingsQueue();
  }

  @Post('properties/:id/assign-field-work')
  @ApiOperation({ summary: 'Team can contact owner or do field work' })
  assignPropertyFieldWork(@Param('id') id: string, @Body() dto: AssignFieldWorkDto) {
    return this.adminService.assignPropertyFieldWork(id, dto);
  }

  @Post('properties/:id/verify-and-publish')
  @ApiOperation({ summary: 'After verify -> Publish the post' })
  verifyAndPublish(@Param('id') id: string) {
    return this.adminService.verifyAndPublishProperty(id);
  }

  @Post('properties/:id/reject')
  @ApiOperation({ summary: 'Reject property listing with reasons' })
  rejectProperty(@Param('id') id: string, @Body() dto: RejectItemDto) {
    return this.adminService.rejectProperty(id, dto);
  }

  // Queue 4: Property Management Requests
  @Get('property-management-review')
  @ApiOperation({ summary: 'Queue 4: Receive Property Management details' })
  getPropertyManagementQueue() {
    return this.adminService.getPropertyManagementQueue();
  }

  @Post('property-management/:id/check-location')
  @ApiOperation({ summary: 'Admin checks location: If location matches vs else then send reject message' })
  checkLocation(@Param('id') id: string, @Body() dto: LocationCheckDecisionDto) {
    return this.adminService.checkPropertyManagementLocation(id, dto);
  }

  @Post('property-management/:id/contact-owner')
  @ApiOperation({ summary: 'If location matches -> Team can contact owner' })
  contactOwner(@Param('id') id: string, @Body() dto: ContactOwnerDto) {
    return this.adminService.contactPropertyManagementOwner(id, dto);
  }

  // Queue 5: Home Loan Requests
  @Get('home-loans-review')
  @ApiOperation({ summary: 'Queue 5: Receive Home Loan details' })
  getHomeLoansQueue() {
    return this.adminService.getHomeLoansQueue();
  }

  @Post('home-loans/:id/contact-user')
  @ApiOperation({ summary: 'Team directly contact user for Home Loan assistance' })
  contactLoanUser(@Param('id') id: string, @Body() dto: ContactOwnerDto) {
    return this.adminService.contactHomeLoanUser(id, dto);
  }

  // Queue 6: Rental Agreement Requests
  @Get('rental-agreements-review')
  @ApiOperation({ summary: 'Queue 6: Receive Rental Agreement details' })
  getRentalAgreementsQueue() {
    return this.adminService.getRentalAgreementsQueue();
  }

  @Post('rental-agreements/:id/prepare-and-send')
  @ApiOperation({ summary: 'Prepare documents -> Send to user' })
  prepareAndSendAgreement(@Param('id') id: string, @Body() dto: PrepareAgreementDto) {
    return this.adminService.prepareAndSendAgreement(id, dto);
  }

  // Queue 7: Owner Background Details
  @Get('owner-background-review')
  @ApiOperation({ summary: 'Queue 7: Receive Owner Background details' })
  getOwnerBackgroundQueue() {
    return this.adminService.getOwnerBackgroundQueue();
  }

  @Post('owner-background/:id/field-work')
  @ApiOperation({ summary: 'Team can contact owner or do field work also' })
  assignOwnerBgFieldWork(@Param('id') id: string, @Body() dto: AssignFieldWorkDto) {
    return this.adminService.assignOwnerBackgroundFieldWork(id, dto);
  }

  @Post('owner-background/:id/collect-and-send-digital')
  @ApiOperation({ summary: 'Collect details -> Admin send details to user through digital' })
  collectAndSendDigital(@Param('id') id: string, @Body() dto: CollectAndSendDigitalDto) {
    return this.adminService.collectAndSendDigitalOwnerDetails(id, dto);
  }
}
