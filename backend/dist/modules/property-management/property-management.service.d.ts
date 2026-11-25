import { PropertyManagementRecord } from '../../common/mock-db.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
import { PrismaService } from '../../database/prisma.service.js';
export declare class PropertyManagementService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    submitRequest(dto: SubmitPropertyManagementDto, userId?: string): Promise<{
        message: string;
        request: PropertyManagementRecord;
    }>;
    getMyRequests(phoneOrUserId: string): Promise<PropertyManagementRecord[] | {
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
    findOne(id: string): Promise<PropertyManagementRecord | {
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
