import { PrismaService } from '../../database/prisma.service.js';
import { PropertyRecord } from '../../common/mock-db.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EventsGateway } from '../events/events.gateway.js';
export declare const SERVICEABLE_LOCALITIES: {
    locality: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
}[];
export declare class PropertiesService {
    private readonly prisma;
    private readonly cloudinaryService;
    private readonly eventsGateway?;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService, eventsGateway?: EventsGateway | undefined);
    findAll(query: QueryPropertyDto): Promise<{
        total: number;
        radiusUsedKm: number;
        properties: any[];
        data: any[];
    } | {
        total: number;
        properties: never[];
        data: never[];
        radiusUsedKm?: undefined;
    }>;
    findUserProperties(userId?: string): Promise<{
        total: number;
        properties: PropertyRecord[];
    }>;
    findOne(id: string): Promise<PropertyRecord | {
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
    remove(id: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePropertyImage(id: string, publicId: string): Promise<{
        success: boolean;
        message: string;
        property: any;
    }>;
    create(dto: CreatePropertyDto, userId?: string): Promise<PropertyRecord>;
    toggleSave(propertyId: string, userId?: string): Promise<{
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
    getMySaved(userId?: string): Promise<{
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
    getLocationSuggestions(query: string): {
        fullLabel: string;
        locality: string;
        city: string;
        pincode: string;
        lat: number;
        lng: number;
    }[];
}
