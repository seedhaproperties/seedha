import { OwnerBackgroundRecord } from '../../common/mock-db.js';
import { RequestOwnerBackgroundDto, PayOwnerBackgroundDto } from './owner-background.dto.js';
export declare class OwnerBackgroundService {
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
        status: "SUBMITTED" | "REJECTED" | "PAYMENT_PENDING" | "PAID" | "ADMIN_CHECKING" | "FIELD_WORK_ASSIGNED" | "DETAILS_COLLECTED" | "REPORT_GENERATED" | "SENT_DIGITALLY";
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
    getMyChecks(phoneOrUserId: string): Promise<OwnerBackgroundRecord[]>;
}
