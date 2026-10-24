import type { Response } from 'express';
import { OwnerBackgroundService } from './owner-background.service.js';
import { RequestOwnerBackgroundDto, PayOwnerBackgroundDto } from './owner-background.dto.js';
export declare class OwnerBackgroundController {
    private readonly ownerBgService;
    constructor(ownerBgService: OwnerBackgroundService);
    createRequest(dto: RequestOwnerBackgroundDto, req: any): Promise<{
        message: string;
        request: import("../../common/mock-db.js").OwnerBackgroundRecord;
        fee: number;
        currency: string;
    }>;
    payAndGenerate(id: string, dto: PayOwnerBackgroundDto): Promise<{
        message: string;
        record: import("../../common/mock-db.js").OwnerBackgroundRecord;
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
    downloadPdf(id: string, res: Response): Promise<void>;
    getMyRequests(req: any): Promise<import("../../common/mock-db.js").OwnerBackgroundRecord[]>;
}
