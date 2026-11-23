import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(query: QueryPropertyDto, userId?: string, ownerOnly?: string): Promise<{
        total: number;
        properties: import("../../common/mock-db.js").PropertyRecord[];
    }>;
    getMyProperties(req: any, queryUserId?: string): Promise<{
        total: number;
        properties: import("../../common/mock-db.js").PropertyRecord[];
    }>;
    getMyPropertiesAlias(req: any, queryUserId?: string): Promise<{
        total: number;
        properties: import("../../common/mock-db.js").PropertyRecord[];
    }>;
    uploadImage(dto: UploadPropertyImageDto): Promise<{
        success: boolean;
        url: string;
        publicId: string;
        format: string | undefined;
        width: number | undefined;
        height: number | undefined;
        bytes: number | undefined;
        message: string;
    }>;
    deletePropertyImage(id: string, publicId?: string, bodyPublicId?: string): Promise<{
        success: boolean;
        message: string;
        property: import("../../common/mock-db.js").PropertyRecord;
    }>;
    findOne(id: string): Promise<import("../../common/mock-db.js").PropertyRecord>;
    getOwnerDetails(id: string): Promise<{
        propertyId: string;
        title: string;
        ownerName: string;
        ownerPhone: string;
        verified: boolean;
        location: string;
    }>;
    create(dto: CreatePropertyDto, req: any): Promise<import("../../common/mock-db.js").PropertyRecord>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
