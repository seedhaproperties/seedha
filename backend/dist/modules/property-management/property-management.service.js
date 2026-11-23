var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PropertyManagementService_1;
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { mockDb } from '../../common/mock-db.js';
import { SERVICEABLE_LOCALITIES } from '../../common/constants.js';
import { PrismaService } from '../../database/prisma.service.js';
let PropertyManagementService = PropertyManagementService_1 = class PropertyManagementService {
    prisma;
    logger = new Logger(PropertyManagementService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitRequest(dto, userId) {
        const isServiceable = SERVICEABLE_LOCALITIES.some((loc) => loc.city.toLowerCase() === dto.city.toLowerCase() &&
            (loc.locality.toLowerCase().includes(dto.locality.toLowerCase()) ||
                dto.locality.toLowerCase().includes(loc.locality.toLowerCase())));
        const generatedId = `pm-${Date.now()}`;
        const newRequest = {
            id: generatedId,
            ownerId: userId,
            ownerName: dto.ownerName,
            ownerPhone: dto.ownerPhone,
            ownerEmail: dto.ownerEmail,
            flatDetails: dto.flatDetails,
            address: dto.address,
            city: dto.city,
            locality: dto.locality,
            serviceRequested: dto.serviceRequested,
            photos: dto.photos || [],
            status: 'SUBMITTED',
            locationMatched: isServiceable,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (this.prisma?.isConnected) {
            try {
                const created = await this.prisma.propertyManagementRequest.create({
                    data: {
                        id: generatedId,
                        ownerId: userId || null,
                        ownerName: dto.ownerName,
                        ownerPhone: dto.ownerPhone,
                        ownerEmail: dto.ownerEmail || null,
                        flatDetails: dto.flatDetails,
                        address: dto.address,
                        city: dto.city,
                        locality: dto.locality,
                        serviceRequested: dto.serviceRequested,
                        photos: dto.photos || [],
                        status: 'SUBMITTED',
                        locationMatched: isServiceable,
                    },
                });
                if (created?.id)
                    newRequest.id = created.id;
            }
            catch (err) {
                this.logger.warn(`Prisma PropertyManagement create error: ${err.message}`);
            }
        }
        mockDb.propertyManagementRequests.unshift(newRequest);
        return {
            message: 'Property management details submitted successfully and forwarded to Seedha Admin team.',
            request: newRequest,
        };
    }
    async getMyRequests(phoneOrUserId) {
        if (this.prisma?.isConnected) {
            try {
                const dbList = await this.prisma.propertyManagementRequest.findMany({
                    where: {
                        OR: [
                            { ownerId: phoneOrUserId },
                            { ownerPhone: phoneOrUserId },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                });
                if (dbList && dbList.length > 0)
                    return dbList;
            }
            catch (err) {
                this.logger.warn(`Prisma PropertyManagement getMyRequests error: ${err.message}`);
            }
        }
        return mockDb.propertyManagementRequests.filter((r) => r.ownerId === phoneOrUserId || r.ownerPhone === phoneOrUserId);
    }
    async findOne(id) {
        if (this.prisma?.isConnected) {
            try {
                const dbReq = await this.prisma.propertyManagementRequest.findUnique({
                    where: { id },
                });
                if (dbReq)
                    return dbReq;
            }
            catch (err) {
                this.logger.warn(`Prisma PropertyManagement findOne error: ${err.message}`);
            }
        }
        const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
        if (!req) {
            throw new NotFoundException(`Property management request ${id} not found`);
        }
        return req;
    }
};
PropertyManagementService = PropertyManagementService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PropertyManagementService);
export { PropertyManagementService };
//# sourceMappingURL=property-management.service.js.map