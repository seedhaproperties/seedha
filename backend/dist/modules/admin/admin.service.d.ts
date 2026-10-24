import { PropertyRecord } from '../../common/mock-db.js';
import { AssignFieldWorkDto, RejectItemDto, LocationCheckDecisionDto, ContactOwnerDto, PrepareAgreementDto, CollectAndSendDigitalDto } from './admin.dto.js';
export declare class AdminService {
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
    getFlatListingsQueue(): PropertyRecord[];
    getRentListingsQueue(): PropertyRecord[];
    getCommercialListingsQueue(): PropertyRecord[];
    assignPropertyFieldWork(id: string, dto: AssignFieldWorkDto): {
        message: string;
        property: PropertyRecord;
    };
    verifyAndPublishProperty(id: string): {
        message: string;
        property: PropertyRecord;
    };
    rejectProperty(id: string, dto: RejectItemDto): {
        message: string;
        property: PropertyRecord;
    };
    getPropertyManagementQueue(): import("../../common/mock-db.js").PropertyManagementRecord[];
    checkPropertyManagementLocation(id: string, dto: LocationCheckDecisionDto): {
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    };
    contactPropertyManagementOwner(id: string, dto: ContactOwnerDto): {
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    };
    getHomeLoansQueue(): import("../../common/mock-db.js").HomeLoanRecord[];
    contactHomeLoanUser(id: string, dto: ContactOwnerDto): {
        message: string;
        request: import("../../common/mock-db.js").HomeLoanRecord;
    };
    getRentalAgreementsQueue(): import("../../common/mock-db.js").RentalAgreementRecord[];
    prepareAndSendAgreement(id: string, dto: PrepareAgreementDto): {
        message: string;
        agreement: import("../../common/mock-db.js").RentalAgreementRecord;
    };
    getOwnerBackgroundQueue(): import("../../common/mock-db.js").OwnerBackgroundRecord[];
    assignOwnerBackgroundFieldWork(id: string, dto: AssignFieldWorkDto): {
        message: string;
        check: import("../../common/mock-db.js").OwnerBackgroundRecord;
    };
    collectAndSendDigitalOwnerDetails(id: string, dto: CollectAndSendDigitalDto): {
        message: string;
        check: import("../../common/mock-db.js").OwnerBackgroundRecord;
    };
}
