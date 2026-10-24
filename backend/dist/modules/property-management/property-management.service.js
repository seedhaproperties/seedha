var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { mockDb } from '../../common/mock-db.js';
import { SERVICEABLE_LOCALITIES } from '../../common/constants.js';
let PropertyManagementService = class PropertyManagementService {
    async submitRequest(dto, userId) {
        const isServiceable = SERVICEABLE_LOCALITIES.some((loc) => loc.city.toLowerCase() === dto.city.toLowerCase() &&
            (loc.locality.toLowerCase().includes(dto.locality.toLowerCase()) ||
                dto.locality.toLowerCase().includes(loc.locality.toLowerCase())));
        const newRequest = {
            id: `pm-${Date.now()}`,
            ownerId: userId,
            ownerName: dto.ownerName,
            ownerPhone: dto.ownerPhone,
            ownerEmail: dto.ownerEmail,
            flatDetails: dto.flatDetails,
            address: dto.address,
            city: dto.city,
            locality: dto.locality,
            serviceRequested: dto.serviceRequested,
            status: 'SUBMITTED',
            locationMatched: isServiceable,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockDb.propertyManagementRequests.unshift(newRequest);
        return {
            message: 'Property management details submitted successfully and forwarded to Seedha Admin team.',
            request: newRequest,
        };
    }
    async getMyRequests(phoneOrUserId) {
        return mockDb.propertyManagementRequests.filter((r) => r.ownerId === phoneOrUserId || r.ownerPhone === phoneOrUserId);
    }
    async findOne(id) {
        const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
        if (!req) {
            throw new NotFoundException(`Property management request ${id} not found`);
        }
        return req;
    }
};
PropertyManagementService = __decorate([
    Injectable()
], PropertyManagementService);
export { PropertyManagementService };
//# sourceMappingURL=property-management.service.js.map