import { AdminService } from './admin.service.js';
import { AssignFieldWorkDto, RejectItemDto, LocationCheckDecisionDto, ContactOwnerDto, PrepareAgreementDto, CollectAndSendDigitalDto } from './admin.dto.js';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getOverview(): {
        pendingFlatListings: number;
        pendingRentListings: number;
        pendingCommercialListings: number;
        pendingPropertyManagement: number;
        pendingHomeLoans: number;
        pendingRentalAgreements: number;
        pendingOwnerBackground: number;
        totalPublishedProperties: number;
    };
    getFlatsQueue(): import("../../common/mock-db.js").PropertyRecord[];
    getRentQueue(): import("../../common/mock-db.js").PropertyRecord[];
    getCommercialQueue(): import("../../common/mock-db.js").PropertyRecord[];
    assignPropertyFieldWork(id: string, dto: AssignFieldWorkDto): {
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    };
    verifyAndPublish(id: string): {
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    };
    rejectProperty(id: string, dto: RejectItemDto): {
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
}
