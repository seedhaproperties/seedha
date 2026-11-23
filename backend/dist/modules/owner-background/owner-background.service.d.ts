import { OwnerBackgroundRecord } from '../../common/mock-db.js';
import { RequestOwnerBackgroundDto, PayOwnerBackgroundDto } from './owner-background.dto.js';
import { PrismaService } from '../../database/prisma.service.js';
export declare class OwnerBackgroundService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createRequest(dto: RequestOwnerBackgroundDto, userId?: string): Promise<{
        message: string;
        request: OwnerBackgroundRecord;
        fee: number;
        currency: string;
    }>;
    payAndSubmit(id: string, dto: PayOwnerBackgroundDto): Promise<{
        message: string;
        record: OwnerBackgroundRecord;
    }>;
    getReport(id: string): Promise<{
        id: string;
        flatNumber: string;
        buildingName: string;
        propertyAddress: string;
        city: string;
        ownerName: string;
        ownerPhone: string;
        status: "SUBMITTED" | "REJECTED" | "COMPLETED" | "PAYMENT_PENDING" | "PAID" | "ADMIN_CHECKING" | "FIELD_WORK_ASSIGNED" | "DETAILS_COLLECTED" | "REPORT_GENERATED" | "SENT_DIGITALLY";
        verificationChecklist: {
            ownershipTitleDeed: string;
            encumbranceCertificateEC: string;
            municipalTaxReceipts: string;
            societyMaintenanceDues: string;
        };
        reportSummary: string | undefined;
        downloadPdfUrl: string | undefined;
        digitalSentAt: string | undefined;
    }>;
    getMyChecks(phoneOrUserId: string): Promise<OwnerBackgroundRecord[] | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        userId: string | null;
        ownerPhone: string;
        ownerName: string;
        status: string;
        propertyAddress: string;
        paymentTxnId: string | null;
        paymentAmount: number;
        flatNumber: string;
        buildingName: string;
        ownershipVerified: boolean;
        legalDisputeClear: boolean;
        taxReceiptsVerified: boolean;
        societyDuesClear: boolean;
        reportSummary: string | null;
        reportPdfUrl: string | null;
        digitalSentAt: Date | null;
        fieldAgentNotes: string | null;
    }[]>;
}
