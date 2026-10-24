var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { mockDb } from '../../common/mock-db.js';
let SiteVisitsService = class SiteVisitsService {
    async bookVisit(propertyId, dto, userId) {
        const property = mockDb.properties.find((p) => p.id === propertyId);
        if (!property) {
            throw new NotFoundException(`Property with ID ${propertyId} not found`);
        }
        const existing = mockDb.siteVisits.find((v) => v.propertyId === propertyId &&
            v.userPhone === dto.userPhone &&
            v.date === dto.date &&
            v.timeSlot === dto.timeSlot &&
            v.status !== 'CANCELLED');
        if (existing) {
            throw new ConflictException('You already have an active visit booking request for this property at the selected date and time slot.');
        }
        const newVisit = {
            id: `visit-${Date.now()}`,
            propertyId,
            userId,
            userName: dto.userName,
            userPhone: dto.userPhone,
            userEmail: dto.userEmail,
            date: dto.date,
            timeSlot: dto.timeSlot,
            status: 'CONFIRMED',
            notes: dto.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockDb.siteVisits.unshift(newVisit);
        return {
            message: 'Property visit booked successfully! Our field team and the owner have been notified.',
            visit: newVisit,
            property: {
                id: property.id,
                title: property.title,
                location: property.location,
                ownerName: property.ownerName,
                ownerPhone: property.ownerPhone,
            },
        };
    }
    async submitRating(visitId, dto) {
        const visit = mockDb.siteVisits.find((v) => v.id === visitId);
        if (!visit) {
            throw new NotFoundException(`Site visit with ID ${visitId} not found`);
        }
        visit.rating = dto.rating;
        visit.ratingComment = dto.ratingComment;
        visit.updatedAt = new Date().toISOString();
        return {
            message: 'Thank you for your rating and feedback!',
            visit,
        };
    }
    async getMyVisits(phoneOrUserId) {
        return mockDb.siteVisits.filter((v) => v.userId === phoneOrUserId || v.userPhone === phoneOrUserId);
    }
};
SiteVisitsService = __decorate([
    Injectable()
], SiteVisitsService);
export { SiteVisitsService };
//# sourceMappingURL=site-visits.service.js.map