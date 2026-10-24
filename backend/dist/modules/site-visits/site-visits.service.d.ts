import { SiteVisitRecord } from '../../common/mock-db.js';
import { BookVisitDto, SubmitRatingDto } from './site-visits.dto.js';
export declare class SiteVisitsService {
    bookVisit(propertyId: string, dto: BookVisitDto, userId?: string): Promise<{
        message: string;
        visit: SiteVisitRecord;
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
        visit: SiteVisitRecord;
    }>;
    getMyVisits(phoneOrUserId: string): Promise<SiteVisitRecord[]>;
}
