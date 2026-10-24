import { PropertyManagementService } from './property-management.service.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
export declare class PropertyManagementController {
    private readonly pmService;
    constructor(pmService: PropertyManagementService);
    submitRequest(dto: SubmitPropertyManagementDto, req: any): Promise<{
        message: string;
        request: import("../../common/mock-db.js").PropertyManagementRecord;
    }>;
    getMyRequests(req: any): Promise<import("../../common/mock-db.js").PropertyManagementRecord[]>;
    findOne(id: string): Promise<import("../../common/mock-db.js").PropertyManagementRecord>;
}
