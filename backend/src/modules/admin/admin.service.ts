import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { mockDb, PropertyRecord } from '../../common/mock-db.js';
import { ListingTypeEnum, PropertyStatusEnum, SERVICEABLE_LOCALITIES } from '../../common/constants.js';
import { PrismaService } from '../../database/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EventsGateway } from '../events/events.gateway.js';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventsGateway?: EventsGateway,
  ) { }

  async getOverview() {
    const totalUsers = mockDb.users.length;
    const totalProps = mockDb.properties.length;
    const publishedProps = mockDb.properties.filter(
      (p) => p.status === PropertyStatusEnum.PUBLISHED || p.status === PropertyStatusEnum.APPROVED,
    ).length;
    const verifiedProps = mockDb.properties.filter((p) => p.verified).length;

    const allRequests = await this.getAllUnifiedRequests();
    const totalRequests = allRequests.length;
    const newRequests = allRequests.filter((r) => r.status === 'new').length;
    const inReview = allRequests.filter(
      (r) => r.status === 'in_review' || r.status === 'assigned' || r.status === 'field_visit',
    ).length;
    const verified = allRequests.filter((r) => r.status === 'verified').length;
    const published = allRequests.filter((r) => r.status === 'published').length;
    const rejected = allRequests.filter((r) => r.status === 'rejected').length;
    const slaAlerts = allRequests.filter(
      (r) =>
        (r.slaDeadlineMinutes ?? r.slaMinutesLeft ?? 100) <= 60 &&
        r.status !== 'published' &&
        r.status !== 'rejected',
    ).length;

    const isPgListing = (p: any) =>
      p.propertyType?.toLowerCase().includes('pg') ||
      p.propertyType?.toLowerCase().includes('hostel') ||
      p.details?.pgAccommodationType ||
      p.title?.toLowerCase().includes('pg') ||
      p.title?.toLowerCase().includes('hostel');

    const pendingPg = mockDb.properties.filter(
      (p) =>
        isPgListing(p) &&
        p.status !== PropertyStatusEnum.PUBLISHED &&
        p.status !== PropertyStatusEnum.APPROVED,
    ).length;
    const pendingFlats = mockDb.properties.filter(
      (p) =>
        !isPgListing(p) &&
        p.listingType === ListingTypeEnum.BUY &&
        p.status !== PropertyStatusEnum.PUBLISHED &&
        p.status !== PropertyStatusEnum.APPROVED,
    ).length;
    const pendingRents = mockDb.properties.filter(
      (p) =>
        !isPgListing(p) &&
        p.listingType === ListingTypeEnum.RENT &&
        p.status !== PropertyStatusEnum.PUBLISHED &&
        p.status !== PropertyStatusEnum.APPROVED,
    ).length;
    const pendingCommercials = mockDb.properties.filter(
      (p) =>
        !isPgListing(p) &&
        p.listingType === ListingTypeEnum.COMMERCIAL &&
        p.status !== PropertyStatusEnum.PUBLISHED &&
        p.status !== PropertyStatusEnum.APPROVED,
    ).length;
    const pendingPm = mockDb.propertyManagementRequests.filter(
      (p) => p.status === 'SUBMITTED' || p.status === 'ADMIN_REVIEW',
    ).length;
    const pendingLoans = mockDb.homeLoanRequests.filter(
      (h) => h.status === 'REQUESTED' || h.status === 'UNDER_REVIEW',
    ).length;
    const pendingAgreements = mockDb.rentalAgreementOrders.filter(
      (r) => r.status === 'PAID' || r.status === 'SUBMITTED',
    ).length;
    const pendingBg = mockDb.ownerBackgroundChecks.filter(
      (o) => o.status === 'PAID' || o.status === 'ADMIN_CHECKING',
    ).length;

    const moduleCounts = {
      flat_building: allRequests.filter(
        (r) => r.module === 'flat_building' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
      rent: allRequests.filter(
        (r) => r.module === 'rent' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
      commercial: allRequests.filter(
        (r) => r.module === 'commercial' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
      pg_hostel: allRequests.filter(
        (r) => r.module === 'pg_hostel' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
      property_management: allRequests.filter(
        (r) => r.module === 'property_management' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
      home_loan: allRequests.filter(
        (r) => r.module === 'home_loan' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
      rental_agreements: allRequests.filter(
        (r) => r.module === 'rental_agreements' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
      owner_background: allRequests.filter(
        (r) => r.module === 'owner_background' && r.status !== 'rejected' && r.status !== 'published',
      ).length,
    };

    const totalIncoming =
      pendingFlats +
      pendingRents +
      pendingCommercials +
      pendingPg +
      pendingPm +
      pendingLoans +
      pendingAgreements +
      pendingBg;

    return {
      totalUsers,
      totalProperties: totalProps,
      totalPublishedProperties: publishedProps,
      totalVerifiedProperties: verifiedProps,
      totalIncoming,
      totalRequests,
      newRequests,
      inReview,
      verified,
      published,
      rejected,
      slaAlerts,
      moduleCounts,
      pendingFlatListings: pendingFlats,
      pendingRentListings: pendingRents,
      pendingCommercialListings: pendingCommercials,
      pendingPgListings: pendingPg,
      pendingPropertyManagement: pendingPm,
      pendingHomeLoans: pendingLoans,
      pendingRentalAgreements: pendingAgreements,
      pendingOwnerBackground: pendingBg,
      activeAgents: mockDb.teamMembers?.length || 4,
    };
  }

  // Queue 1: Flat/Building (Buy / Sell) Listings
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

  // PG & Hostel Listings Queue
  getPgListingsQueue() {
    return mockDb.properties.filter((p: any) =>
      p.propertyType?.toLowerCase().includes('pg') ||
      p.propertyType?.toLowerCase().includes('hostel') ||
      p.details?.pgAccommodationType ||
      p.title?.toLowerCase().includes('pg') ||
      p.title?.toLowerCase().includes('hostel'),
    );
  }

  // Common Property Workflow: Assign Field Work / Contact Owner
  assignPropertyFieldWork(id: string, dto: AssignFieldWorkDto) {
    const prop = mockDb.properties.find((p) => p.id === id);
    if (!prop) throw new NotFoundException(`Property ${id} not found`);

    prop.status = PropertyStatusEnum.VERIFICATION_IN_PROGRESS;
    prop.fieldAgentName = dto.fieldAgentName;
    prop.fieldNotes = dto.fieldNotes;
    prop.updatedAt = new Date().toISOString();
    mockDb.saveToDisk();

    return {
      message: `Field work assigned to ${dto.fieldAgentName}. Verification in progress.`,
      property: prop,
    };
  }

  // Common Property Workflow: After verify -> Publish the post / Approve
  async verifyAndPublishProperty(id: string) {
    let prop = mockDb.properties.find((p) => p.id === id);
    if (!prop && this.prisma?.isConnected) {
      try {
        const dbP: any = await this.prisma.property.findUnique({ where: { id } });
        if (dbP) {
          prop = dbP;
          mockDb.properties.unshift(dbP);
        }
      } catch {}
    }
    if (!prop) throw new NotFoundException(`Property ${id} not found`);

    prop.status = PropertyStatusEnum.PUBLISHED;
    prop.verified = true;
    prop.verifiedAt = new Date().toISOString();
    prop.publishedAt = new Date().toISOString();
    prop.updatedAt = new Date().toISOString();
    mockDb.saveToDisk();

    // Sync state update to PostgreSQL
    if (this.prisma?.isConnected) {
      try {
        await this.prisma.property.updateMany({
          where: { id },
          data: {
            status: 'PUBLISHED' as any,
            verified: true,
            verifiedAt: new Date(),
            publishedAt: new Date(),
          },
        });
      } catch (err: any) {
        this.logger.warn(`Prisma publish sync: ${err.message}`);
      }
    }

    if (this.eventsGateway) {
      try {
        this.eventsGateway.emitPropertyStatusUpdated({
          propertyId: prop.id,
          ownerId: prop.ownerId,
          status: 'PUBLISHED',
          verified: true,
          listingType: prop.listingType,
          propertyType: prop.propertyType,
          title: prop.title,
          message: `Your property "${prop.title}" has been approved and published!`,
        });
      } catch (err) {
        // Safe emission
      }
    }

    return {
      message: `Property verified and successfully published to live listings!`,
      property: prop,
    };
  }

  async approveProperty(id: string) {
    return this.verifyAndPublishProperty(id);
  }

  async rejectProperty(id: string, dto: RejectItemDto) {
    let prop = mockDb.properties.find((p) => p.id === id);
    if (!prop && this.prisma?.isConnected) {
      try {
        const dbP: any = await this.prisma.property.findUnique({ where: { id } });
        if (dbP) {
          prop = dbP;
          mockDb.properties.unshift(dbP);
        }
      } catch {}
    }
    if (!prop) throw new NotFoundException(`Property ${id} not found`);

    prop.status = PropertyStatusEnum.REJECTED;
    prop.verified = false;
    prop.rejectionReason = dto.reason;
    prop.updatedAt = new Date().toISOString();
    mockDb.saveToDisk();

    // Sync state update to PostgreSQL
    if (this.prisma?.isConnected) {
      try {
        await this.prisma.property.updateMany({
          where: { id },
          data: {
            status: 'REJECTED' as any,
            verified: false,
            rejectionReason: dto.reason,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Prisma reject sync: ${err.message}`);
      }
    }

    if (this.eventsGateway) {
      try {
        this.eventsGateway.emitPropertyStatusUpdated({
          propertyId: prop.id,
          ownerId: prop.ownerId,
          status: 'REJECTED',
          verified: false,
          rejectionReason: dto.reason,
          listingType: prop.listingType,
          propertyType: prop.propertyType,
          title: prop.title,
          message: `Your property "${prop.title}" listing review was rejected: ${dto.reason}`,
        });
      } catch (err) {
        // Safe emission
      }
    }

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
      mockDb.saveToDisk();
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
      mockDb.saveToDisk();
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
    mockDb.saveToDisk();

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
    mockDb.saveToDisk();

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
    mockDb.saveToDisk();

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
    mockDb.saveToDisk();

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
    mockDb.saveToDisk();

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

    // Fetch from Prisma PostgreSQL if connected and merge seamlessly with mockDb
    if (this.prisma?.isConnected) {
      try {
        const fetchDbData = async () => {
          const [dbProps, dbPm, dbLoans, dbAgr, dbBg] = await Promise.all([
            this.prisma.property.findMany(),
            this.prisma.propertyManagementRequest.findMany(),
            this.prisma.homeLoanRequest.findMany(),
            this.prisma.rentalAgreementOrder.findMany(),
            this.prisma.ownerBackgroundCheck.findMany(),
          ]);
          return { dbProps, dbPm, dbLoans, dbAgr, dbBg };
        };

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Prisma query timeout (1000ms)')), 1000),
        );

        const { dbProps, dbPm, dbLoans, dbAgr, dbBg } = await Promise.race([
          fetchDbData(),
          timeoutPromise,
        ]);

        if (dbProps && dbProps.length > 0) {
          const propMap = new Map<string, any>();
          for (const p of dbProps) propMap.set(p.id, p);
          for (const p of mockDb.properties) propMap.set(p.id, p);
          properties = Array.from(propMap.values());
        }

        if (dbPm && dbPm.length > 0) {
          const pmMap = new Map<string, any>();
          for (const p of dbPm) pmMap.set(p.id, p);
          for (const p of mockDb.propertyManagementRequests) pmMap.set(p.id, p);
          pmRequests = Array.from(pmMap.values());
        }

        if (dbLoans && dbLoans.length > 0) {
          const lMap = new Map<string, any>();
          for (const l of dbLoans) lMap.set(l.id, l);
          for (const l of mockDb.homeLoanRequests) lMap.set(l.id, l);
          loanRequests = Array.from(lMap.values());
        }

        if (dbAgr && dbAgr.length > 0) {
          const aMap = new Map<string, any>();
          for (const a of dbAgr) aMap.set(a.id, a);
          for (const a of mockDb.rentalAgreementOrders) aMap.set(a.id, a);
          agreementOrders = Array.from(aMap.values());
        }

        if (dbBg && dbBg.length > 0) {
          const bMap = new Map<string, any>();
          for (const b of dbBg) bMap.set(b.id, b);
          for (const b of mockDb.ownerBackgroundChecks) bMap.set(b.id, b);
          bgChecks = Array.from(bMap.values());
        }
      } catch (err) {
        this.prisma.isConnected = false;
        this.logger.warn(`Prisma query fallback: ${(err as Error).message}`);
      }
    }

    const unified: any[] = [];

    // Helper status mapper
    const mapPropertyStatus = (st: string) => {
      switch (st) {
        case 'PENDING':
        case 'SUBMITTED':
          return 'new';
        case 'UNDER_REVIEW':
          return 'in_review';
        case 'VERIFICATION_IN_PROGRESS':
          return 'field_visit';
        case 'APPROVED':
        case 'VERIFIED':
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

    // 1. Properties (Flat/Building, Rent, Commercial, PG & Hostel)
    for (const p of properties) {
      let mod = 'flat_building';
      const isPg =
        p.details?.category === 'pg_hostel' ||
        p.propertyType?.toLowerCase().includes('pg') ||
        p.propertyType?.toLowerCase().includes('hostel') ||
        p.details?.pgAccommodationType ||
        p.title?.toLowerCase().includes('pg') ||
        p.title?.toLowerCase().includes('hostel');

      if (isPg) {
        mod = 'pg_hostel';
      } else if (
        p.listingType === ListingTypeEnum.COMMERCIAL ||
        p.listingType === 'COMMERCIAL' ||
        p.details?.category === 'commercial' ||
        ['commercial', 'shop', 'office'].some((x) => (p.propertyType || '').toLowerCase().includes(x))
      ) {
        mod = 'commercial';
      } else if (
        p.listingType === ListingTypeEnum.RENT ||
        p.listingType === 'RENT' ||
        p.details?.category === 'rent'
      ) {
        mod = 'rent';
      } else {
        mod = 'flat_building';
      }

      const createdDate = p.createdAt ? new Date(p.createdAt) : new Date();
      const ageHours = Math.max(0, (Date.now() - createdDate.getTime()) / (1000 * 60 * 60));
      const slaLeft = Math.max(0, Math.round(24 * 60 - ageHours * 60));
      const relativeTime =
        ageHours < 1
          ? `${Math.max(1, Math.round(ageHours * 60))}m ago`
          : ageHours < 24
            ? `${Math.round(ageHours)}h ago`
            : `${Math.round(ageHours / 24)}d ago`;
      const isLive =
        p.status === PropertyStatusEnum.PUBLISHED ||
        p.status === PropertyStatusEnum.APPROVED ||
        p.verified === true;
      const isRejected = p.status === PropertyStatusEnum.REJECTED;

      unified.push({
        id: p.id,
        code: p.id.slice(0, 8).toUpperCase(),
        module: mod,
        title: p.title,
        description: p.description || '',
        subtitle: `${p.bedrooms ? `${p.bedrooms} BHK · ` : ''}${p.propertyType || 'Apartment'} · ${p.city}`,
        locality: p.location,
        city: p.city,
        state: p.state || 'Telangana',
        pincode: p.pincode || '',
        latitude: p.latitude,
        longitude: p.longitude,
        fullAddress: p.fullAddress || `${p.location}, ${p.city}`,
        address: p.fullAddress || `${p.location}, ${p.city}`,
        priceDisplay: p.priceLabel || `₹${(p.price || 0).toLocaleString('en-IN')}`,
        priceNumeric: p.price || 0,
        areaSqFt: p.area || 1200,
        configLabel: `${p.bedrooms || 2} BHK · ${p.bathrooms || 2} Bath`,
        furnishing: p.furnishing || 'Semi-Furnished',
        availability: 'Immediate',
        status: mapPropertyStatus(p.status),
        postPublishState: isLive ? 'live' : 'unpublished',
        slaMinutesLeft: isLive || isRejected ? 0 : slaLeft,
        slaUrgent: !isLive && !isRejected && slaLeft < 120,
        submittedAt: p.createdAt || new Date().toISOString(),
        relativeTime,
        assignedToId: p.fieldAgentName ? 'tm-1' : undefined,
        assignedToName: p.fieldAgentName,
        rejectionReason: p.rejectionReason,
        amenities: p.amenities || [],
        details: p.details || {},
        ownerOrUser: {
          name: p.ownerName,
          role: 'Owner',
          phone: p.ownerPhone,
          email: p.ownerEmail || '',
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
    return mockDb.teamMembers || [];
  }

  addTeamMember(dto: { name: string; role?: string; phone: string; zone?: string }) {
    const initials = dto.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const member = {
      id: `tm-${Date.now().toString(36)}`,
      name: dto.name,
      role: dto.role || 'Field Agent',
      phone: dto.phone,
      zone: dto.zone || 'Hyderabad West',
      activeTasks: 0,
      completedThisWeek: 0,
      avgTurnaroundHrs: 3.5,
      initials,
    };

    if (!mockDb.teamMembers) mockDb.teamMembers = [];
    mockDb.teamMembers.push(member);
    mockDb.saveToDisk();

    return member;
  }

  unpublishProperty(id: string, note?: string) {
    const prop = mockDb.properties.find((p) => p.id === id);
    if (!prop) throw new NotFoundException(`Property ${id} not found`);

    prop.status = PropertyStatusEnum.PENDING;
    prop.verified = false;
    prop.updatedAt = new Date().toISOString();
    mockDb.saveToDisk();

    if (this.eventsGateway) {
      try {
        this.eventsGateway.emitPropertyStatusUpdated({
          propertyId: prop.id,
          ownerId: prop.ownerId,
          status: 'PENDING',
          verified: false,
          title: prop.title,
          message: `Property "${prop.title}" unpublished and moved back to pending review.`,
        });
      } catch (err) {
        // Safe emission
      }
    }

    return {
      message: `Property "${prop.title}" unpublished and moved back to pending review.`,
      property: prop,
    };
  }

  getLiveListings() {
    return mockDb.properties.filter(
      (p) => p.status === PropertyStatusEnum.PUBLISHED || p.status === PropertyStatusEnum.APPROVED,
    );
  }

  getUsers() {
    return mockDb.users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      role: u.role || 'USER',
      city: u.city || 'Hyderabad',
      createdAt: u.createdAt || new Date().toISOString(),
    }));
  }

  async deleteProperty(id: string) {
    const idx = mockDb.properties.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`Property ${id} not found`);
    const removed = mockDb.properties.splice(idx, 1)[0];

    // Clean up images from Cloudinary
    if (removed.imagePublicIds && removed.imagePublicIds.length > 0) {
      try {
        await this.cloudinaryService.deleteMultipleImages(removed.imagePublicIds);
      } catch (err: any) {
        this.logger.warn(`Could not clean up Cloudinary images for deleted property ${id}: ${err?.message}`);
      }
    }

    mockDb.saveToDisk();
    return {
      message: `Property "${removed.title}" successfully deleted from database and Cloudinary.`,
      id: removed.id,
    };
  }

  getReports() {
    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalProperties: mockDb.properties.length,
        publishedProperties: mockDb.properties.filter((p) => p.status === PropertyStatusEnum.PUBLISHED).length,
        verifiedProperties: mockDb.properties.filter((p) => p.verified).length,
        rejectedProperties: mockDb.properties.filter((p) => p.status === PropertyStatusEnum.REJECTED).length,
        activeRequests:
          mockDb.propertyManagementRequests.length +
          mockDb.homeLoanRequests.length +
          mockDb.rentalAgreementOrders.length +
          mockDb.ownerBackgroundChecks.length,
        totalRegisteredUsers: mockDb.users.length,
      },
      auditLogs: mockDb.properties.slice(0, 15).map((p) => ({
        id: `audit-${p.id}`,
        propertyTitle: p.title,
        status: p.status,
        timestamp: p.updatedAt || p.createdAt,
        owner: p.ownerName,
        action: p.verified
          ? 'Verified & Published'
          : p.status === PropertyStatusEnum.REJECTED
            ? 'Rejected with Feedback'
            : 'Under Admin Review',
      })),
    };
  }

  getNotifications() {
    const list: any[] = [];
    for (const p of mockDb.properties.slice(0, 8)) {
      list.push({
        id: `notif-${p.id}`,
        title: `Property: ${p.title}`,
        message: `Status: ${p.status} · Owner: ${p.ownerName} (${p.ownerPhone})`,
        time: p.updatedAt || p.createdAt || 'Recent',
        type:
          p.status === PropertyStatusEnum.PUBLISHED
            ? 'success'
            : p.status === PropertyStatusEnum.REJECTED
              ? 'danger'
              : 'info',
      });
    }
    for (const req of mockDb.homeLoanRequests.slice(0, 5)) {
      list.push({
        id: `notif-loan-${req.id}`,
        title: `Home Loan: ${req.userName}`,
        message: `Applied for ₹${req.loanAmount} with ${req.selectedBank}. Status: ${req.status}`,
        time: req.createdAt || 'Recent',
        type: 'warning',
      });
    }
    return list;
  }
}
