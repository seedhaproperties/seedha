import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, QueryPropertyDto } from './properties.dto.js';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(query: QueryPropertyDto): Promise<{
        total: number;
        properties: import("../../common/mock-db.js").PropertyRecord[];
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
}
