import { SiteVisitsService } from './site-visits.service.js';
import { BookVisitDto, SubmitRatingDto } from './site-visits.dto.js';
export declare class SiteVisitsController {
    private readonly siteVisitsService;
    constructor(siteVisitsService: SiteVisitsService);
    bookVisit(propertyId: string, dto: BookVisitDto, req: any): Promise<{
        message: string;
        visit: import("../../common/mock-db.js").SiteVisitRecord;
        property: {
            id: string;
            title: string;
            location: string;
            ownerName: string;
            ownerPhone: string;
        };
    }>;
    submitRating(visitId: string, dto: SubmitRatingDto): Promise<{
        message: string;
        visit: import("../../common/mock-db.js").SiteVisitRecord;
    }>;
    getMyVisits(req: any): Promise<import("../../common/mock-db.js").SiteVisitRecord[]>;
}
