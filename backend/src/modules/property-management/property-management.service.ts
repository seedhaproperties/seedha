import { Injectable, NotFoundException } from '@nestjs/common';
import { mockDb, PropertyManagementRecord } from '../../common/mock-db.js';
import { SubmitPropertyManagementDto } from './property-management.dto.js';
import { SERVICEABLE_LOCALITIES } from '../../common/constants.js';

@Injectable()
export class PropertyManagementService {
  async submitRequest(dto: SubmitPropertyManagementDto, userId?: string) {
    // Check if location matches serviceability
    const isServiceable = SERVICEABLE_LOCALITIES.some(
      (loc) =>
        loc.city.toLowerCase() === dto.city.toLowerCase() &&
        (loc.locality.toLowerCase().includes(dto.locality.toLowerCase()) ||
          dto.locality.toLowerCase().includes(loc.locality.toLowerCase())),
    );

    const newRequest: PropertyManagementRecord = {
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
      status: 'SUBMITTED', // Directed to Admin
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

  async getMyRequests(phoneOrUserId: string) {
    return mockDb.propertyManagementRequests.filter(
      (r) => r.ownerId === phoneOrUserId || r.ownerPhone === phoneOrUserId,
    );
  }

  async findOne(id: string) {
    const req = mockDb.propertyManagementRequests.find((r) => r.id === id);
    if (!req) {
      throw new NotFoundException(`Property management request ${id} not found`);
    }
    return req;
  }
}
