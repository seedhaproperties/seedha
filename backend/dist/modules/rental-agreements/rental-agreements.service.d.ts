import { RentalAgreementRecord } from '../../common/mock-db.js';
import { RentalAgreementDetailsDto, OrderAgreementDto } from './rental-agreements.dto.js';
import { PrismaService } from '../../database/prisma.service.js';
export declare class RentalAgreementsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
    getMyAgreements(phoneOrUserId: string): Promise<RentalAgreementRecord[] | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        landlordPhone: string;
        tenantPhone: string;
        status: string;
        propertyAddress: string;
        landlordName: string;
        landlordEmail: string | null;
        landlordAddress: string;
        tenantName: string;
        tenantEmail: string | null;
        tenantAddress: string;
        monthlyRent: number;
        securityDeposit: number;
        leaseTermMonths: number;
        agreementStartDate: string;
        paymentTxnId: string | null;
        paymentAmount: number;
        documentUrl: string | null;
        preparedByStaff: string | null;
    }[]>;
    findOne(id: string): Promise<RentalAgreementRecord | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        landlordPhone: string;
        tenantPhone: string;
        status: string;
        propertyAddress: string;
        landlordName: string;
        landlordEmail: string | null;
        landlordAddress: string;
        tenantName: string;
        tenantEmail: string | null;
        tenantAddress: string;
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
