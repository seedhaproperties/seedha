import { PropertyRecord } from '../../common/mock-db.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EventsGateway } from '../events/events.gateway.js';
export declare class PropertiesService {
    private readonly cloudinaryService;
    private readonly eventsGateway?;
    constructor(cloudinaryService: CloudinaryService, eventsGateway?: EventsGateway | undefined);
    findAll(query: QueryPropertyDto): Promise<{
        total: number;
        properties: PropertyRecord[];
    }>;
    findUserProperties(userId?: string): Promise<{
        total: number;
        properties: PropertyRecord[];
    }>;
    findOne(id: string): Promise<PropertyRecord>;
    getOwnerDetails(id: string): Promise<{
        propertyId: string;
        title: string;
        ownerName: string;
        ownerPhone: string;
        verified: boolean;
        location: string;
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
        property: PropertyRecord;
    }>;
    create(dto: CreatePropertyDto, userId?: string): Promise<PropertyRecord>;
}
