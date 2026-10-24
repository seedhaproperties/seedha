import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { mockDb, PropertyRecord } from '../../common/mock-db.js';
import { ListingTypeEnum, PropertyStatusEnum, SERVICEABLE_LOCALITIES } from '../../common/constants.js';
import {
  AssignFieldWorkDto,
  RejectItemDto,
  LocationCheckDecisionDto,
  ContactOwnerDto,
  PrepareAgreementDto,
  CollectAndSendDigitalDto,
} from './admin.dto.js';

@Injectable()
export class AdminService {
  getOverview() {
    return {
      pendingFlatListings: mockDb.properties.filter(
        (p) => p.listingType === ListingTypeEnum.BUY && p.status !== PropertyStatusEnum.PUBLISHED,
      ).length,
      pendingRentListings: mockDb.properties.filter(
        (p) => p.listingType === ListingTypeEnum.RENT && p.status !== PropertyStatusEnum.PUBLISHED,
      ).length,
      pendingCommercialListings: mockDb.properties.filter(
        (p) => p.listingType === ListingTypeEnum.COMMERCIAL && p.status !== PropertyStatusEnum.PUBLISHED,
      ).length,
      pendingPropertyManagement: mockDb.propertyManagementRequests.filter(
        (p) => p.status === 'SUBMITTED' || p.status === 'ADMIN_REVIEW',
      ).length,
      pendingHomeLoans: mockDb.homeLoanRequests.filter(
        (h) => h.status === 'REQUESTED' || h.status === 'UNDER_REVIEW',
      ).length,
      pendingRentalAgreements: mockDb.rentalAgreementOrders.filter(
        (r) => r.status === 'PAID' || r.status === 'SUBMITTED',
      ).length,
      pendingOwnerBackground: mockDb.ownerBackgroundChecks.filter(
        (o) => o.status === 'PAID' || o.status === 'ADMIN_CHECKING',
      ).length,
      totalPublishedProperties: mockDb.properties.filter(
        (p) => p.status === PropertyStatusEnum.PUBLISHED,
      ).length,
    };
  }

  // Queue 1: Flat/Building (Buy) Listings
  getFlatListingsQueue() {
    return mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.BUY);
  }

  // Queue 2: Rent Listings
  getRentListingsQueue() {
    return mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.RENT);
  }

  // Queue 3: Commercial Listings
  getCommercialListingsQueue() {
    return mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.COMMERCIAL);
  }

  // Common Property Workflow: Assign Field Work / Contact Owner
  assignPropertyFieldWork(id: string, dto: AssignFieldWorkDto) {
    const prop = mockDb.properties.find((p) => p.id === id);
    if (!prop) throw new NotFoundException(`Property ${id} not found`);

    prop.status = PropertyStatusEnum.VERIFICATION_IN_PROGRESS;
    prop.fieldAgentName = dto.fieldAgentName;
    prop.fieldNotes = dto.fieldNotes;
    prop.updatedAt = new Date().toISOString();

    return {
      message: `Field work assigned to ${dto.fieldAgentName}. Verification in progress.`,
      property: prop,
    };
  }

  // Common Property Workflow: After verify -> Publish the post
  verifyAndPublishProperty(id: string) {
    const prop = mockDb.properties.find((p) => p.id === id);
    if (!prop) throw new NotFoundException(`Property ${id} not found`);

    prop.status = PropertyStatusEnum.PUBLISHED;
    prop.verified = true;
    prop.verifiedAt = new Date().toISOString();
    prop.publishedAt = new Date().toISOString();
    prop.updatedAt = new Date().toISOString();

    return {
      message: `Property verified and successfully published to live listings!`,
      property: prop,
    };
  }

  rejectProperty(id: string, dto: RejectItemDto) {
    const prop = mockDb.properties.find((p) => p.id === id);
    if (!prop) throw new NotFoundException(`Property ${id} not found`);

    prop.status = PropertyStatusEnum.REJECTED;
    prop.rejectionReason = dto.reason;
    prop.updatedAt = new Date().toISOString();

    return {
      message: `Property listing rejected with notification sent to owner.`,
      property: prop,
    };
  }

  // Queue 4: Property Management Requests
  getPropertyManagementQueue() {
    return mockDb.propertyManagementRequests;
  }

  checkPropertyManagementLocation(id: string, dto: LocationCheckDecisionDto) {
    const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
    if (!req) throw new NotFoundException(`Request ${id} not found`);

    if (dto.matchesLocation) {
      req.status = 'LOCATION_CHECK_PASSED';
      req.locationMatched = true;
      req.updatedAt = new Date().toISOString();
      return {
        message: 'Location matches serviceability rules! Ready for team contact to owner.',
        request: req,
      };
    } else {
      req.status = 'LOCATION_CHECK_REJECTED';
      req.locationMatched = false;
      req.rejectionMessage =
        dto.rejectMessage || 'Sorry, this location is currently outside our service coverage.';
      req.updatedAt = new Date().toISOString();
      return {
        message: 'Location does not match service zone. Rejection message sent to owner.',
        request: req,
      };
    }
  }

  contactPropertyManagementOwner(id: string, dto: ContactOwnerDto) {
    const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
    if (!req) throw new NotFoundException(`Request ${id} not found`);

    if (!req.locationMatched && req.status === 'LOCATION_CHECK_REJECTED') {
      throw new BadRequestException('Cannot contact owner on rejected location');
    }

    req.status = 'OWNER_CONTACTED';
    req.assignedTeamMember = dto.assignedStaff || 'Kavitha (Property Ops Lead)';
    req.contactNotes = dto.notes;
    req.updatedAt = new Date().toISOString();

    return {
      message: 'Owner successfully contacted by operations team. Property management process onboarded.',
      request: req,
    };
  }

  // Queue 5: Home Loan Requests
  getHomeLoansQueue() {
    return mockDb.homeLoanRequests;
  }

  contactHomeLoanUser(id: string, dto: ContactOwnerDto) {
    const loan = mockDb.homeLoanRequests.find((h) => h.id === id);
    if (!loan) throw new NotFoundException(`Loan request ${id} not found`);

    loan.status = 'TEAM_CONTACTED';
    loan.assignedStaff = dto.assignedStaff || 'Siddharth (Loan Advisor)';
    loan.contactNotes = dto.notes;
    loan.updatedAt = new Date().toISOString();

    return {
      message: 'Team directly contacted customer regarding home loan processing and document pickup.',
      request: loan,
    };
  }

  // Queue 6: Rental Agreement Requests
  getRentalAgreementsQueue() {
    return mockDb.rentalAgreementOrders;
  }

  prepareAndSendAgreement(id: string, dto: PrepareAgreementDto) {
    const agr = mockDb.rentalAgreementOrders.find((a) => a.id === id);
    if (!agr) throw new NotFoundException(`Rental agreement ${id} not found`);

    agr.status = 'SENT_TO_USER';
    agr.preparedByStaff = 'Seedha Legal Verification Desk';
    agr.documentUrl = dto.documentUrl || `/api/v1/rental-agreements/documents/${agr.id}.pdf`;
    agr.updatedAt = new Date().toISOString();

    return {
      message: 'Legal rental agreement prepared and dispatched to user digitally.',
      agreement: agr,
    };
  }

  // Queue 7: Owner Background Details
  getOwnerBackgroundQueue() {
    return mockDb.ownerBackgroundChecks;
  }

  assignOwnerBackgroundFieldWork(id: string, dto: AssignFieldWorkDto) {
    const check = mockDb.ownerBackgroundChecks.find((o) => o.id === id);
    if (!check) throw new NotFoundException(`Owner background check ${id} not found`);

    check.status = 'FIELD_WORK_ASSIGNED';
    check.fieldAgentNotes = `${dto.fieldAgentName}: ${dto.fieldNotes || 'Field verification initiated'}`;
    check.updatedAt = new Date().toISOString();

    return {
      message: `Field verification assigned to ${dto.fieldAgentName} to contact owner and inspect records.`,
      check,
    };
  }

  collectAndSendDigitalOwnerDetails(id: string, dto: CollectAndSendDigitalDto) {
    const check = mockDb.ownerBackgroundChecks.find((o) => o.id === id);
    if (!check) throw new NotFoundException(`Owner background check ${id} not found`);

    check.status = 'SENT_DIGITALLY';
    check.ownershipVerified = dto.ownershipVerified;
    check.legalDisputeClear = dto.legalDisputeClear;
    check.taxReceiptsVerified = true;
    check.societyDuesClear = true;
    check.reportSummary = dto.summary;
    check.digitalSentAt = new Date().toISOString();
    check.reportPdfUrl = `/api/v1/owner-background/${check.id}/report-pdf`;
    check.updatedAt = new Date().toISOString();

    return {
      message: 'Details collected and background verification report sent to user through digital delivery.',
      check,
    };
  }
}
