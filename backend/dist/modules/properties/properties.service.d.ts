import { PropertyRecord } from '../../common/mock-db.js';
import { CreatePropertyDto, QueryPropertyDto } from './properties.dto.js';
export declare class PropertiesService {
    findAll(query: QueryPropertyDto): Promise<{
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
    create(dto: CreatePropertyDto, userId?: string): Promise<PropertyRecord>;
}
