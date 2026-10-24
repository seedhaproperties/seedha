import { PropertyManagementRecord } from '../../common/mock-db.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
export declare class PropertyManagementService {
    submitRequest(dto: SubmitPropertyManagementDto, userId?: string): Promise<{
        message: string;
        request: PropertyManagementRecord;
    }>;
    getMyRequests(phoneOrUserId: string): Promise<PropertyManagementRecord[]>;
    findOne(id: string): Promise<PropertyManagementRecord>;
}
