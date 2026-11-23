import { RentalAgreementsService } from './rental-agreements.service.js';
import { RentalAgreementDetailsDto, OrderAgreementDto } from './rental-agreements.dto.js';
export declare class RentalAgreementsController {
    private readonly rentalAgreementsService;
    constructor(rentalAgreementsService: RentalAgreementsService);
    previewAgreement(dto: RentalAgreementDetailsDto): {
        templateVersion: string;
        previewContent: string;
        price: number;
        currency: string;
        summary: {
            landlord: string;
            tenant: string;
            propertyAddress: string;
            monthlyRent: number;
            securityDeposit: number;
            termMonths: number;
        };
    };
    orderAgreement(payload: {
        details: RentalAgreementDetailsDto;
        payment: OrderAgreementDto;
    }, req: any): Promise<{
        message: string;
        order: import("../../common/mock-db.js").RentalAgreementRecord;
    }>;
    getMyAgreements(req: any): Promise<import("../../common/mock-db.js").RentalAgreementRecord[] | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        landlordPhone: string;
        tenantPhone: string;
        status: string;
        landlordName: string;
        landlordEmail: string | null;
        landlordAddress: string;
        tenantName: string;
        tenantEmail: string | null;
        tenantAddress: string;
        propertyAddress: string;
        monthlyRent: number;
        securityDeposit: number;
        leaseTermMonths: number;
        agreementStartDate: string;
        paymentTxnId: string | null;
        paymentAmount: number;
        documentUrl: string | null;
        preparedByStaff: string | null;
    }[]>;
    getAgreementById(id: string): Promise<import("../../common/mock-db.js").RentalAgreementRecord | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        landlordPhone: string;
        tenantPhone: string;
        status: string;
        landlordName: string;
        landlordEmail: string | null;
        landlordAddress: string;
        tenantName: string;
        tenantEmail: string | null;
        tenantAddress: string;
        propertyAddress: string;
        monthlyRent: number;
        securityDeposit: number;
        leaseTermMonths: number;
        agreementStartDate: string;
        paymentTxnId: string | null;
        paymentAmount: number;
        documentUrl: string | null;
        preparedByStaff: string | null;
    }>;
}
