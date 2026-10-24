import { RentalAgreementRecord } from '../../common/mock-db.js';
import { RentalAgreementDetailsDto, OrderAgreementDto } from './rental-agreements.dto.js';
export declare class RentalAgreementsService {
    generateAgreementPreview(dto: RentalAgreementDetailsDto): {
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
    createAndOrderAgreement(details: RentalAgreementDetailsDto, order: OrderAgreementDto, userId?: string): Promise<{
        message: string;
        order: RentalAgreementRecord;
    }>;
    getMyAgreements(phoneOrUserId: string): Promise<RentalAgreementRecord[]>;
    findOne(id: string): Promise<RentalAgreementRecord>;
}
