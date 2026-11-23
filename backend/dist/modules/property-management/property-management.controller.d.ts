import { PropertyManagementService } from './property-management.service.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
export declare class PropertyManagementController {
    private readonly pmService;
    constructor(pmService: PropertyManagementService);
    submitRequest(dto: SubmitPropertyManagementDto, req: any): Promise<{
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    }>;
    getMyRequests(req: any): Promise<import("../../common/mock-db.js").PropertyManagementRecord[] | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        ownerPhone: string;
        ownerId: string | null;
        ownerName: string;
        ownerEmail: string | null;
        status: string;
        flatDetails: string;
        address: string;
        locality: string;
        serviceRequested: string;
        photos: string[];
        locationMatched: boolean;
        rejectionMessage: string | null;
        assignedTeamMember: string | null;
        contactNotes: string | null;
    }[]>;
    findOne(id: string): Promise<import("../../common/mock-db.js").PropertyManagementRecord | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        ownerPhone: string;
        ownerId: string | null;
        ownerName: string;
        ownerEmail: string | null;
        status: string;
        flatDetails: string;
        address: string;
        locality: string;
        serviceRequested: string;
        photos: string[];
        locationMatched: boolean;
        rejectionMessage: string | null;
        assignedTeamMember: string | null;
        contactNotes: string | null;
    }>;
}
