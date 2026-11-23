import { PropertyRecord } from '../../common/mock-db.js';
import { PropertyStatusEnum } from '../../common/constants.js';
import { PrismaService } from '../../database/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EventsGateway } from '../events/events.gateway.js';
import { AssignFieldWorkDto, RejectItemDto, LocationCheckDecisionDto, ContactOwnerDto, PrepareAgreementDto, CollectAndSendDigitalDto } from './admin.dto.js';
export declare class AdminService {
    private readonly prisma;
    private readonly cloudinaryService;
    private readonly eventsGateway?;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService, eventsGateway?: EventsGateway | undefined);
    getOverview(): Promise<{
        totalUsers: number;
        totalProperties: number;
        totalPublishedProperties: number;
        totalVerifiedProperties: number;
        totalIncoming: number;
        totalRequests: number;
        newRequests: number;
        inReview: number;
        verified: number;
        published: number;
        rejected: number;
        slaAlerts: number;
        moduleCounts: {
            flat_building: number;
            rent: number;
            commercial: number;
            pg_hostel: number;
            property_management: number;
            home_loan: number;
            rental_agreements: number;
            owner_background: number;
        };
        pendingFlatListings: number;
        pendingRentListings: number;
        pendingCommercialListings: number;
        pendingPgListings: number;
        pendingPropertyManagement: number;
        pendingHomeLoans: number;
        pendingRentalAgreements: number;
        pendingOwnerBackground: number;
        activeAgents: number;
    }>;
    getFlatListingsQueue(): PropertyRecord[];
    getRentListingsQueue(): PropertyRecord[];
    getCommercialListingsQueue(): PropertyRecord[];
    getPgListingsQueue(): PropertyRecord[];
    assignPropertyFieldWork(id: string, dto: AssignFieldWorkDto): {
        message: string;
        property: PropertyRecord;
    };
    verifyAndPublishProperty(id: string): Promise<{
        message: string;
        property: PropertyRecord;
    }>;
    approveProperty(id: string): Promise<{
        message: string;
        property: PropertyRecord;
    }>;
    rejectProperty(id: string, dto: RejectItemDto): Promise<{
        message: string;
        property: PropertyRecord;
    }>;
    getPropertyManagementQueue(): import("../../common/mock-db.js").PropertyManagementRecord[];
    checkPropertyManagementLocation(id: string, dto: LocationCheckDecisionDto): Promise<{
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    }>;
    contactPropertyManagementOwner(id: string, dto: ContactOwnerDto): Promise<{
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    }>;
    getHomeLoansQueue(): import("../../common/mock-db.js").HomeLoanRecord[];
    contactHomeLoanUser(id: string, dto: ContactOwnerDto): Promise<{
        message: string;
        request: import("../../common/mock-db.js").HomeLoanRecord;
    }>;
    getRentalAgreementsQueue(): import("../../common/mock-db.js").RentalAgreementRecord[];
    prepareAndSendAgreement(id: string, dto: PrepareAgreementDto): Promise<{
        message: string;
        agreement: import("../../common/mock-db.js").RentalAgreementRecord;
    }>;
    getOwnerBackgroundQueue(): import("../../common/mock-db.js").OwnerBackgroundRecord[];
    assignOwnerBackgroundFieldWork(id: string, dto: AssignFieldWorkDto): Promise<{
        message: string;
        check: import("../../common/mock-db.js").OwnerBackgroundRecord;
    }>;
    collectAndSendDigitalOwnerDetails(id: string, dto: CollectAndSendDigitalDto): Promise<{
        message: string;
        check: import("../../common/mock-db.js").OwnerBackgroundRecord;
    }>;
    getAllUnifiedRequests(filters?: {
        module?: string;
        status?: string;
        search?: string;
    }): Promise<any[]>;
    getUnifiedRequestById(id: string): Promise<any>;
    getTeamMembers(): import("../../common/mock-db.js").TeamMemberRecord[];
    addTeamMember(dto: {
        name: string;
        role?: string;
        phone: string;
        zone?: string;
    }): {
        id: string;
        name: string;
        role: string;
        phone: string;
        zone: string;
        activeTasks: number;
        completedThisWeek: number;
        avgTurnaroundHrs: number;
        initials: string;
    };
    unpublishProperty(id: string, note?: string): {
        message: string;
        property: PropertyRecord;
    };
    getLiveListings(): PropertyRecord[];
    getUsers(): {
        id: string;
        name: string;
        phone: string;
        email: string;
        role: import("../../common/constants.js").UserRole;
        city: string;
        createdAt: string;
    }[];
    deleteProperty(id: string): Promise<{
        message: string;
        id: string;
    }>;
    getReports(): {
        generatedAt: string;
        summary: {
            totalProperties: number;
            publishedProperties: number;
            verifiedProperties: number;
            rejectedProperties: number;
            activeRequests: number;
            totalRegisteredUsers: number;
        };
        auditLogs: {
            id: string;
            propertyTitle: string;
            status: PropertyStatusEnum;
            timestamp: string;
            owner: string;
            action: string;
        }[];
    };
    getNotifications(): any[];
}
