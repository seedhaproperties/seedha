var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { mockDb } from '../../common/mock-db.js';
import { ListingTypeEnum, PropertyStatusEnum } from '../../common/constants.js';
let AdminService = class AdminService {
    getOverview() {
        return {
            pendingFlatListings: mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.BUY && p.status !== PropertyStatusEnum.PUBLISHED).length,
            pendingRentListings: mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.RENT && p.status !== PropertyStatusEnum.PUBLISHED).length,
            pendingCommercialListings: mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.COMMERCIAL && p.status !== PropertyStatusEnum.PUBLISHED).length,
            pendingPropertyManagement: mockDb.propertyManagementRequests.filter((p) => p.status === 'SUBMITTED' || p.status === 'ADMIN_REVIEW').length,
            pendingHomeLoans: mockDb.homeLoanRequests.filter((h) => h.status === 'REQUESTED' || h.status === 'UNDER_REVIEW').length,
            pendingRentalAgreements: mockDb.rentalAgreementOrders.filter((r) => r.status === 'PAID' || r.status === 'SUBMITTED').length,
            pendingOwnerBackground: mockDb.ownerBackgroundChecks.filter((o) => o.status === 'PAID' || o.status === 'ADMIN_CHECKING').length,
            totalPublishedProperties: mockDb.properties.filter((p) => p.status === PropertyStatusEnum.PUBLISHED).length,
        };
    }
    getFlatListingsQueue() {
        return mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.BUY);
    }
    getRentListingsQueue() {
        return mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.RENT);
    }
    getCommercialListingsQueue() {
        return mockDb.properties.filter((p) => p.listingType === ListingTypeEnum.COMMERCIAL);
    }
    assignPropertyFieldWork(id, dto) {
        const prop = mockDb.properties.find((p) => p.id === id);
        if (!prop)
            throw new NotFoundException(`Property ${id} not found`);
        prop.status = PropertyStatusEnum.VERIFICATION_IN_PROGRESS;
        prop.fieldAgentName = dto.fieldAgentName;
        prop.fieldNotes = dto.fieldNotes;
        prop.updatedAt = new Date().toISOString();
        return {
            message: `Field work assigned to ${dto.fieldAgentName}. Verification in progress.`,
            property: prop,
        };
    }
    verifyAndPublishProperty(id) {
        const prop = mockDb.properties.find((p) => p.id === id);
        if (!prop)
            throw new NotFoundException(`Property ${id} not found`);
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
    rejectProperty(id, dto) {
        const prop = mockDb.properties.find((p) => p.id === id);
        if (!prop)
            throw new NotFoundException(`Property ${id} not found`);
        prop.status = PropertyStatusEnum.REJECTED;
        prop.rejectionReason = dto.reason;
        prop.updatedAt = new Date().toISOString();
        return {
            message: `Property listing rejected with notification sent to owner.`,
            property: prop,
        };
    }
    getPropertyManagementQueue() {
        return mockDb.propertyManagementRequests;
    }
    checkPropertyManagementLocation(id, dto) {
        const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
        if (!req)
            throw new NotFoundException(`Request ${id} not found`);
        if (dto.matchesLocation) {
            req.status = 'LOCATION_CHECK_PASSED';
            req.locationMatched = true;
            req.updatedAt = new Date().toISOString();
            return {
                message: 'Location matches serviceability rules! Ready for team contact to owner.',
                request: req,
            };
        }
        else {
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
    contactPropertyManagementOwner(id, dto) {
        const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
        if (!req)
            throw new NotFoundException(`Request ${id} not found`);
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
    getHomeLoansQueue() {
        return mockDb.homeLoanRequests;
    }
    contactHomeLoanUser(id, dto) {
        const loan = mockDb.homeLoanRequests.find((h) => h.id === id);
        if (!loan)
            throw new NotFoundException(`Loan request ${id} not found`);
        loan.status = 'TEAM_CONTACTED';
        loan.assignedStaff = dto.assignedStaff || 'Siddharth (Loan Advisor)';
        loan.contactNotes = dto.notes;
        loan.updatedAt = new Date().toISOString();
        return {
            message: 'Team directly contacted customer regarding home loan processing and document pickup.',
            request: loan,
        };
    }
    getRentalAgreementsQueue() {
        return mockDb.rentalAgreementOrders;
    }
    prepareAndSendAgreement(id, dto) {
        const agr = mockDb.rentalAgreementOrders.find((a) => a.id === id);
        if (!agr)
            throw new NotFoundException(`Rental agreement ${id} not found`);
        agr.status = 'SENT_TO_USER';
        agr.preparedByStaff = 'Seedha Legal Verification Desk';
        agr.documentUrl = dto.documentUrl || `/api/v1/rental-agreements/documents/${agr.id}.pdf`;
        agr.updatedAt = new Date().toISOString();
        return {
            message: 'Legal rental agreement prepared and dispatched to user digitally.',
            agreement: agr,
        };
    }
    getOwnerBackgroundQueue() {
        return mockDb.ownerBackgroundChecks;
    }
    assignOwnerBackgroundFieldWork(id, dto) {
        const check = mockDb.ownerBackgroundChecks.find((o) => o.id === id);
        if (!check)
            throw new NotFoundException(`Owner background check ${id} not found`);
        check.status = 'FIELD_WORK_ASSIGNED';
        check.fieldAgentNotes = `${dto.fieldAgentName}: ${dto.fieldNotes || 'Field verification initiated'}`;
        check.updatedAt = new Date().toISOString();
        return {
            message: `Field verification assigned to ${dto.fieldAgentName} to contact owner and inspect records.`,
            check,
        };
    }
    collectAndSendDigitalOwnerDetails(id, dto) {
        const check = mockDb.ownerBackgroundChecks.find((o) => o.id === id);
        if (!check)
            throw new NotFoundException(`Owner background check ${id} not found`);
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
};
AdminService = __decorate([
    Injectable()
], AdminService);
export { AdminService };
//# sourceMappingURL=admin.service.js.map