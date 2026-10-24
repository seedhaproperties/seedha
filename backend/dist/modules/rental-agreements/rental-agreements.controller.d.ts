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
    getMyAgreements(req: any): Promise<import("../../common/mock-db.js").RentalAgreementRecord[]>;
    getAgreementById(id: string): Promise<import("../../common/mock-db.js").RentalAgreementRecord>;
}
