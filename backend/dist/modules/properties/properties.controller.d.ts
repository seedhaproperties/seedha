import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    getSuggestions(query: string): Promise<{
        fullLabel: string;
        locality: string;
        city: string;
        pincode: string;
        lat: number;
        lng: number;
    }[]>;
    getMySaved(req: any): Promise<{
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        pincode: string | null;
        ownerPhone: string;
        ownerId: string | null;
        images: string[];
        listingType: import("@prisma/client").$Enums.ListingType;
        propertyType: string;
        price: number;
        priceLabel: string;
        location: string;
        latitude: number | null;
        longitude: number | null;
        area: number;
        bedrooms: number;
        bathrooms: number;
        furnishing: string;
        parking: boolean;
        deposit: number | null;
        maintenance: number | null;
        amenities: string[];
        ownerName: string;
        facing: string | null;
        floor: string | null;
        totalFloors: number | null;
        status: import("@prisma/client").$Enums.PropertyStatus;
        verified: boolean;
        featured: boolean;
        rejectionReason: string | null;
        fieldAgentName: string | null;
        fieldNotes: string | null;
        verifiedAt: Date | null;
        publishedAt: Date | null;
    }[]>;
    findAll(query: QueryPropertyDto, userId?: string, ownerOnly?: string): Promise<{
        total: number;
        properties: import("../../common/mock-db.js").PropertyRecord[];
    } | {
        total: number;
        radiusUsedKm: number;
        properties: any[];
        data: any[];
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
        property: any;
    }>;
    findOne(id: string): Promise<import("../../common/mock-db.js").PropertyRecord | {
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        pincode: string | null;
        ownerPhone: string;
        ownerId: string | null;
        images: string[];
        listingType: import("@prisma/client").$Enums.ListingType;
        propertyType: string;
        price: number;
        priceLabel: string;
        location: string;
        latitude: number | null;
        longitude: number | null;
        area: number;
        bedrooms: number;
        bathrooms: number;
        furnishing: string;
        parking: boolean;
        deposit: number | null;
        maintenance: number | null;
        amenities: string[];
        ownerName: string;
        facing: string | null;
        floor: string | null;
        totalFloors: number | null;
        status: import("@prisma/client").$Enums.PropertyStatus;
        verified: boolean;
        featured: boolean;
        rejectionReason: string | null;
        fieldAgentName: string | null;
        fieldNotes: string | null;
        verifiedAt: Date | null;
        publishedAt: Date | null;
    }>;
    getOwnerDetails(id: string): Promise<{
        propertyId: any;
        title: any;
        ownerName: any;
        ownerPhone: any;
        verified: boolean;
        location: any;
    }>;
    toggleSave(id: string, req: any): Promise<{
        success: boolean;
        saved: boolean;
        propertyId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        saved?: undefined;
        propertyId?: undefined;
    }>;
    create(dto: CreatePropertyDto, req: any): Promise<import("../../common/mock-db.js").PropertyRecord>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
