import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { mockDb, PropertyManagementRecord } from '../../common/mock-db.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
import { SERVICEABLE_LOCALITIES } from '../../common/constants.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class PropertyManagementService {
  private readonly logger = new Logger(PropertyManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submitRequest(dto: SubmitPropertyManagementDto, userId?: string) {
    // Check if location matches serviceability
    const isServiceable = SERVICEABLE_LOCALITIES.some(
      (loc) =>
        loc.city.toLowerCase() === dto.city.toLowerCase() &&
        (loc.locality.toLowerCase().includes(dto.locality.toLowerCase()) ||
          dto.locality.toLowerCase().includes(loc.locality.toLowerCase())),
    );

    const generatedId = `pm-${Date.now()}`;
    const newRequest: PropertyManagementRecord = {
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
      status: 'SUBMITTED', // Directed to Admin
      locationMatched: isServiceable,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist to PostgreSQL if connected
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
        if (created?.id) newRequest.id = created.id;
      } catch (err: any) {
        this.logger.warn(`Prisma PropertyManagement create error: ${err.message}`);
      }
    }

    // 2. Keep in-memory mockDb synchronized
    mockDb.propertyManagementRequests.unshift(newRequest);

    return {
      message: 'Property management details submitted successfully and forwarded to Seedha Admin team.',
      request: newRequest,
    };
  }

  async getMyRequests(phoneOrUserId: string) {
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
        if (dbList && dbList.length > 0) return dbList;
      } catch (err: any) {
        this.logger.warn(`Prisma PropertyManagement getMyRequests error: ${err.message}`);
      }
    }

    return mockDb.propertyManagementRequests.filter(
      (r) => r.ownerId === phoneOrUserId || r.ownerPhone === phoneOrUserId,
    );
  }

  async findOne(id: string) {
    if (this.prisma?.isConnected) {
      try {
        const dbReq = await this.prisma.propertyManagementRequest.findUnique({
          where: { id },
        });
        if (dbReq) return dbReq;
      } catch (err: any) {
        this.logger.warn(`Prisma PropertyManagement findOne error: ${err.message}`);
      }
    }

    const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
    if (!req) {
      throw new NotFoundException(`Property management request ${id} not found`);
    }
    return req;
  }
}
