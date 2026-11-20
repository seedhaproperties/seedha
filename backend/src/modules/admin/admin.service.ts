import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { mockDb, PropertyRecord } from '../../common/mock-db.js';
import { ListingTypeEnum, PropertyStatusEnum, SERVICEABLE_LOCALITIES } from '../../common/constants.js';
import { PrismaService } from '../../database/prisma.service.js';
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
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}
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

  // Unified Request Aggregator for Admin Web Dashboard
  async getAllUnifiedRequests(filters?: { module?: string; status?: string; search?: string }) {
    let properties: any[] = mockDb.properties;
    let pmRequests: any[] = mockDb.propertyManagementRequests;
    let loanRequests: any[] = mockDb.homeLoanRequests;
    let agreementOrders: any[] = mockDb.rentalAgreementOrders;
    let bgChecks: any[] = mockDb.ownerBackgroundChecks;

    // Fetch from Prisma PostgreSQL if connected
    if (this.prisma.isConnected) {
      try {
        const dbProps = await this.prisma.property.findMany();
        if (dbProps && dbProps.length > 0) properties = dbProps;

        const dbPm = await this.prisma.propertyManagementRequest.findMany();
        if (dbPm && dbPm.length > 0) pmRequests = dbPm;

        const dbLoans = await this.prisma.homeLoanRequest.findMany();
        if (dbLoans && dbLoans.length > 0) loanRequests = dbLoans;

        const dbAgr = await this.prisma.rentalAgreementOrder.findMany();
        if (dbAgr && dbAgr.length > 0) agreementOrders = dbAgr;

        const dbBg = await this.prisma.ownerBackgroundCheck.findMany();
        if (dbBg && dbBg.length > 0) bgChecks = dbBg;
      } catch (err) {
        this.logger.warn(`Prisma query fallback: ${(err as Error).message}`);
      }
    }

    const unified: any[] = [];

    // Helper status mapper
    const mapPropertyStatus = (st: string) => {
      switch (st) {
        case 'SUBMITTED':
          return 'new';
        case 'UNDER_REVIEW':
          return 'in_review';
        case 'VERIFICATION_IN_PROGRESS':
          return 'field_visit';
        case 'APPROVED':
        case 'VERIFIED':
          return 'verified';
        case 'PUBLISHED':
          return 'published';
        case 'REJECTED':
          return 'rejected';
        case 'NEEDS_CORRECTION':
          return 'needs_info';
        default:
          return (st || 'new').toLowerCase();
      }
    };

    // 1. Properties (Flat/Building, Rent, Commercial)
    for (const p of properties) {
      let mod = 'flat_building';
      if (p.listingType === ListingTypeEnum.RENT || p.listingType === 'RENT') mod = 'rent';
      if (p.listingType === ListingTypeEnum.COMMERCIAL || p.listingType === 'COMMERCIAL') mod = 'commercial';

      unified.push({
        id: p.id,
        code: p.id.slice(0, 8).toUpperCase(),
        module: mod,
        title: p.title,
        subtitle: `${p.bedrooms ? `${p.bedrooms} BHK · ` : ''}${p.propertyType || 'Apartment'} · ${p.city}`,
        locality: p.location,
        city: p.city,
        address: `${p.location}, ${p.city}`,
        priceDisplay: p.priceLabel || `₹${(p.price || 0).toLocaleString('en-IN')}`,
        priceNumeric: p.price || 0,
        areaSqFt: p.area || 1200,
        configLabel: `${p.bedrooms || 2} BHK · ${p.bathrooms || 2} Bath`,
        furnishing: p.furnishing || 'Semi-Furnished',
        availability: 'Immediate',
        status: mapPropertyStatus(p.status),
        postPublishState: p.status === 'PUBLISHED' ? 'live' : 'unpublished',
        slaMinutesLeft: 45,
        submittedAt: p.createdAt || new Date().toISOString(),
        relativeTime: '2h ago',
        assignedToId: p.fieldAgentName ? 'tm-1' : undefined,
        assignedToName: p.fieldAgentName,
        ownerOrUser: {
          name: p.ownerName,
          role: 'Owner',
          phone: p.ownerPhone,
          email: '',
          whatsapp: p.ownerPhone,
        },
        visualVariant: mod === 'commercial' ? 'commercial' : 'apartment',
        images: p.images || [],
        photos: p.images || [],
        documents: [
          {
            id: `doc-${p.id}-1`,
            name: 'Registered Title Deed Scan',
            type: 'application/pdf',
            size: '2.4 MB',
            verified: p.verified || false,
            uploadedAt: p.createdAt || 'Recent',
            summary: 'Sub-registrar title certification deed',
          },
        ],
        auditLog: [
          {
            id: `aud-${p.id}-1`,
            actor: 'System',
            action: 'Property submitted by owner from User Mobile App',
            timestamp: p.createdAt || new Date().toISOString(),
          },
        ],
        fieldVisit: {
          gpsCheckedIn: !!p.fieldNotes,
          photos: [],
          ownerConfirmed: p.verified || false,
          notes: p.fieldNotes || '',
          agentName: p.fieldAgentName,
        },
      });
    }

    // 2. Property Management Requests (Queue 4)
    for (const pm of pmRequests) {
      unified.push({
        id: pm.id,
        code: pm.id.slice(0, 8).toUpperCase(),
        module: 'property_management',
        title: pm.flatDetails || `Property Management — ${pm.locality}`,
        subtitle: `Service: ${pm.serviceRequested || 'End-to-end Rental & Maintenance'}`,
        locality: pm.locality,
        city: pm.city,
        address: pm.address || `${pm.locality}, ${pm.city}`,
        priceDisplay: pm.serviceRequested || 'Management Service',
        priceNumeric: 15000,
        areaSqFt: 1450,
        configLabel: 'Standard Unit',
        status: pm.status === 'SUBMITTED' ? 'new' : pm.status === 'OWNER_CONTACTED' ? 'in_review' : 'assigned',
        slaMinutesLeft: 30,
        submittedAt: pm.createdAt || new Date().toISOString(),
        relativeTime: '1h ago',
        assignedToName: pm.assignedTeamMember,
        ownerOrUser: {
          name: pm.ownerName,
          role: 'Owner',
          phone: pm.ownerPhone,
          email: pm.ownerEmail || '',
          whatsapp: pm.ownerPhone,
        },
        visualVariant: 'management',
        images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'],
        documents: [],
        auditLog: [
          {
            id: `aud-${pm.id}`,
            actor: 'User Mobile App',
            action: 'Property management service onboarding requested by owner',
            timestamp: pm.createdAt || new Date().toISOString(),
          },
        ],
        locationCheck: {
          status: pm.locationMatched ? 'matched' : 'pending',
          inServiceRadius: pm.locationMatched,
          distanceKm: 4.2,
          nearestHub: 'Hyderabad West Hub',
          latLng: '17.4485, 78.3758',
        },
        fieldVisit: {
          gpsCheckedIn: false,
          photos: [],
          ownerConfirmed: false,
          notes: pm.contactNotes || '',
        },
      });
    }

    // 3. Home Loan Requests (Queue 5)
    for (const hl of loanRequests) {
      unified.push({
        id: hl.id,
        code: hl.id.slice(0, 8).toUpperCase(),
        module: 'home_loan',
        title: `Home Loan Advisory — ${hl.loanType || 'Purchase'}`,
        subtitle: `Bank: ${hl.selectedBank || 'HDFC Bank'} · EMI: ₹${(hl.calculatedEmi || 0).toLocaleString('en-IN')}`,
        locality: 'Hyderabad',
        city: 'Hyderabad',
        address: 'Direct Borrower Application',
        priceDisplay: `₹${((hl.loanAmount || 5000000) / 100000).toFixed(1)} Lakhs`,
        priceNumeric: hl.loanAmount || 5000000,
        areaSqFt: 0,
        configLabel: `${hl.tenureYears || 20} Yrs Tenure`,
        status: hl.status === 'REQUESTED' ? 'new' : 'in_review',
        slaMinutesLeft: 60,
        submittedAt: hl.createdAt || new Date().toISOString(),
        relativeTime: '3h ago',
        assignedToName: hl.assignedStaff,
        ownerOrUser: {
          name: hl.userName,
          role: 'Applicant',
          phone: hl.userPhone,
          email: hl.userEmail || '',
          whatsapp: hl.userPhone,
        },
        visualVariant: 'loan',
        images: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'],
        documents: [],
        auditLog: [
          {
            id: `aud-${hl.id}`,
            actor: 'User Mobile App',
            action: 'Home loan eligibility check submitted by user',
            timestamp: hl.createdAt || new Date().toISOString(),
          },
        ],
        homeLoan: {
          stage: hl.status === 'REQUESTED' ? 'new_lead' : 'contacted',
          partnerBank: hl.selectedBank || 'HDFC Bank',
          loanAmount: `₹${hl.loanAmount || 5000000}`,
          tenureYears: hl.tenureYears || 20,
          cibilScore: 785,
          employmentType: 'Salaried Professional',
          monthlyIncome: `₹${hl.monthlyIncome || 120000}`,
        },
        fieldVisit: {
          gpsCheckedIn: false,
          photos: [],
          ownerConfirmed: false,
          notes: hl.contactNotes || '',
        },
      });
    }

    // 4. Rental Agreement Orders (Queue 6)
    for (const ra of agreementOrders) {
      unified.push({
        id: ra.id,
        code: ra.id.slice(0, 8).toUpperCase(),
        module: 'rental_agreements',
        title: `Rental Agreement — ${ra.landlordName} & ${ra.tenantName}`,
        subtitle: `Address: ${ra.propertyAddress || 'Hyderabad'}`,
        locality: 'Hyderabad',
        city: 'Hyderabad',
        address: ra.propertyAddress || 'Hyderabad',
        priceDisplay: `₹${(ra.monthlyRent || 25000).toLocaleString('en-IN')}/mo`,
        priceNumeric: ra.monthlyRent || 25000,
        areaSqFt: 0,
        configLabel: `${ra.leaseTermMonths || 11} Months Lease`,
        status: ra.status === 'SENT_TO_USER' ? 'published' : ra.status === 'SUBMITTED' || ra.status === 'PAID' ? 'new' : 'in_review',
        slaMinutesLeft: 20,
        submittedAt: ra.createdAt || new Date().toISOString(),
        relativeTime: '45m ago',
        assignedToName: ra.preparedByStaff,
        ownerOrUser: {
          name: ra.landlordName,
          role: 'Owner',
          phone: ra.landlordPhone,
          email: ra.landlordEmail || '',
          whatsapp: ra.landlordPhone,
        },
        visualVariant: 'agreement',
        images: ['https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800'],
        documents: [
          {
            id: `doc-${ra.id}`,
            name: 'E-Stamp Verified Agreement Draft',
            type: 'application/pdf',
            size: '1.8 MB',
            verified: true,
            uploadedAt: ra.createdAt || 'Recent',
            summary: 'Prepared legal agreement draft',
          },
        ],
        auditLog: [
          {
            id: `aud-${ra.id}`,
            actor: 'User Mobile App',
            action: 'Rental agreement generation order placed by landlord',
            timestamp: ra.createdAt || new Date().toISOString(),
          },
        ],
        rentalAgreement: {
          stage: ra.status === 'SENT_TO_USER' ? 'delivered' : 'review',
          monthlyRent: `₹${ra.monthlyRent || 25000}`,
          securityDeposit: `₹${ra.securityDeposit || 50000}`,
          lockInMonths: 6,
          durationMonths: ra.leaseTermMonths || 11,
          tenantName: ra.tenantName,
          landlordName: ra.landlordName,
          eSignMethod: 'Aadhaar eSign OTP',
        },
        fieldVisit: {
          gpsCheckedIn: false,
          photos: [],
          ownerConfirmed: true,
          notes: '',
        },
      });
    }

    // 5. Owner Background Checks (Queue 7)
    for (const ob of bgChecks) {
      unified.push({
        id: ob.id,
        code: ob.id.slice(0, 8).toUpperCase(),
        module: 'owner_background',
        title: `Owner BG Check — ${ob.ownerName} (${ob.buildingName || ob.flatNumber || 'Flat'})`,
        subtitle: `Location: ${ob.propertyAddress || ob.city || 'Hyderabad'}`,
        locality: ob.city || 'Hyderabad',
        city: ob.city || 'Hyderabad',
        address: ob.propertyAddress || `${ob.flatNumber}, ${ob.buildingName}`,
        priceDisplay: `₹${ob.paymentAmount || 499} Check`,
        priceNumeric: ob.paymentAmount || 499,
        areaSqFt: 0,
        configLabel: 'Due Diligence Verification',
        status: ob.status === 'SENT_DIGITALLY' ? 'published' : ob.status === 'SUBMITTED' ? 'new' : 'in_review',
        slaMinutesLeft: 55,
        submittedAt: ob.createdAt || new Date().toISOString(),
        relativeTime: '2h ago',
        assignedToName: 'Field Legal Desk',
        ownerOrUser: {
          name: ob.ownerName,
          role: 'Owner',
          phone: ob.ownerPhone,
          email: '',
          whatsapp: ob.ownerPhone,
        },
        visualVariant: 'background',
        images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800'],
        documents: [],
        auditLog: [
          {
            id: `aud-${ob.id}`,
            actor: 'User Mobile App',
            action: 'Owner background and property title check requested by prospective tenant',
            timestamp: ob.createdAt || new Date().toISOString(),
          },
        ],
        ownerBackground: {
          result: ob.ownershipVerified && ob.legalDisputeClear ? 'clear' : 'pending',
          privacyConsent: true,
          consentTimestamp: ob.createdAt || new Date().toISOString(),
          checks: [
            {
              id: 'c1',
              label: 'Ownership Deed Verification',
              status: ob.ownershipVerified ? 'passed' : 'pending',
              note: 'Sub-registrar office records matched',
            },
            {
              id: 'c2',
              label: 'Civil Court Litigation Search',
              status: ob.legalDisputeClear ? 'passed' : 'pending',
              note: 'Zero dispute records in district court registry',
            },
          ],
        },
        fieldVisit: {
          gpsCheckedIn: !!ob.fieldAgentNotes,
          photos: [],
          ownerConfirmed: false,
          notes: ob.fieldAgentNotes || '',
        },
      });
    }

    // Apply filters
    let filtered = unified;
    if (filters?.module && filters.module !== 'all') {
      filtered = filtered.filter((r) => r.module === filters.module);
    }
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.ownerOrUser?.name.toLowerCase().includes(q) ||
          r.ownerOrUser?.phone.includes(q) ||
          r.locality.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  async getUnifiedRequestById(id: string) {
    const list = await this.getAllUnifiedRequests();
    return list.find((r) => r.id === id) || null;
  }

  getTeamMembers() {
    return [
      {
        id: 'tm-1',
        name: 'Kavitha Reddy',
        role: 'Field Agent',
        phone: '+91 98490 12345',
        zone: 'HITEC City & Madhapur',
        activeTasks: 4,
        completedThisWeek: 12,
        avgTurnaroundHrs: 2.8,
        initials: 'KR',
      },
      {
        id: 'tm-2',
        name: 'Rajesh Varma',
        role: 'Verification Exec',
        phone: '+91 98480 23456',
        zone: 'Gachibowli & Financial District',
        activeTasks: 3,
        completedThisWeek: 9,
        avgTurnaroundHrs: 3.4,
        initials: 'RV',
      },
      {
        id: 'tm-3',
        name: 'Siddharth Rao',
        role: 'Loan Advisor',
        phone: '+91 98480 34567',
        zone: 'Central Hyderabad',
        activeTasks: 5,
        completedThisWeek: 15,
        avgTurnaroundHrs: 4.1,
        initials: 'SR',
      },
      {
        id: 'tm-4',
        name: 'Pooja Sharma',
        role: 'Legal Ops',
        phone: '+91 98480 45678',
        zone: 'Secunderabad & Jubilee Hills',
        activeTasks: 2,
        completedThisWeek: 18,
        avgTurnaroundHrs: 1.9,
        initials: 'PS',
      },
    ];
  }

  getLiveListings() {
    return mockDb.properties.filter((p) => p.status === PropertyStatusEnum.PUBLISHED);
  }
}
