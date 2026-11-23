import { AdminService } from './admin.service.js';
import { AssignFieldWorkDto, RejectItemDto, LocationCheckDecisionDto, ContactOwnerDto, PrepareAgreementDto, CollectAndSendDigitalDto } from './admin.dto.js';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    getAllRequests(module?: string, status?: string, search?: string): Promise<any[]>;
    getRequestById(id: string): Promise<any>;
    getTeam(): import("../../common/mock-db.js").TeamMemberRecord[];
    addTeamMember(body: {
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
    getListings(): import("../../common/mock-db.js").PropertyRecord[];
    getFlatsQueue(): import("../../common/mock-db.js").PropertyRecord[];
    getRentQueue(): import("../../common/mock-db.js").PropertyRecord[];
    getCommercialQueue(): import("../../common/mock-db.js").PropertyRecord[];
    getPgQueue(): import("../../common/mock-db.js").PropertyRecord[];
    assignPropertyFieldWork(id: string, dto: AssignFieldWorkDto): {
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    };
    verifyAndPublish(id: string): {
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    };
    approveProperty(id: string): {
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    };
    rejectProperty(id: string, dto: RejectItemDto): {
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    };
    unpublishProperty(id: string, note?: string): {
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    };
    getPropertyManagementQueue(): import("../../common/mock-db.js").PropertyManagementRecord[];
    checkLocation(id: string, dto: LocationCheckDecisionDto): {
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    };
    contactOwner(id: string, dto: ContactOwnerDto): {
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    };
    getHomeLoansQueue(): import("../../common/mock-db.js").HomeLoanRecord[];
    contactLoanUser(id: string, dto: ContactOwnerDto): {
        message: string;
        request: import("../../common/mock-db.js").HomeLoanRecord;
    };
    getRentalAgreementsQueue(): import("../../common/mock-db.js").RentalAgreementRecord[];
    prepareAndSendAgreement(id: string, dto: PrepareAgreementDto): {
        message: string;
        agreement: import("../../common/mock-db.js").RentalAgreementRecord;
    };
    getOwnerBackgroundQueue(): import("../../common/mock-db.js").OwnerBackgroundRecord[];
    assignOwnerBgFieldWork(id: string, dto: AssignFieldWorkDto): {
        message: string;
        check: import("../../common/mock-db.js").OwnerBackgroundRecord;
    };
    collectAndSendDigital(id: string, dto: CollectAndSendDigitalDto): {
        message: string;
        check: import("../../common/mock-db.js").OwnerBackgroundRecord;
    };
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
            status: import("../../common/constants.js").PropertyStatusEnum;
            timestamp: string;
            owner: string;
            action: string;
        }[];
    };
    getNotifications(): any[];
}
