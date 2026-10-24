import { Injectable, NotFoundException } from '@nestjs/common';
import { mockDb, PropertyRecord } from '../../common/mock-db.js';
import { CreatePropertyDto, QueryPropertyDto } from './properties.dto.js';
import { ListingTypeEnum, PropertyStatusEnum } from '../../common/constants.js';

@Injectable()
export class PropertiesService {
  async findAll(query: QueryPropertyDto) {
    let results = mockDb.properties.filter(
      (p) => p.status === PropertyStatusEnum.PUBLISHED,
    );

    if (query.type) {
      results = results.filter((p) => p.listingType === query.type);
    }

    if (query.city) {
      results = results.filter((p) =>
        p.city.toLowerCase().includes(query.city!.toLowerCase()),
      );
    }

    if (query.location) {
      results = results.filter((p) =>
        p.location.toLowerCase().includes(query.location!.toLowerCase()),
      );
    }

    if (query.minPrice !== undefined) {
      results = results.filter((p) => p.price >= query.minPrice!);
    }

    if (query.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= query.maxPrice!);
    }

    if (query.bhk !== undefined) {
      results = results.filter((p) => p.bedrooms === Number(query.bhk));
    }

    if (query.propertyType) {
      results = results.filter(
        (p) => p.propertyType.toLowerCase() === query.propertyType!.toLowerCase(),
      );
    }

    return {
      total: results.length,
      properties: results,
    };
  }

  async findOne(id: string) {
    const prop = mockDb.properties.find((p) => p.id === id);
    if (!prop) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return prop;
  }

  async getOwnerDetails(id: string) {
    const prop = await this.findOne(id);
    return {
      propertyId: prop.id,
      title: prop.title,
      ownerName: prop.ownerName,
      ownerPhone: prop.ownerPhone,
      verified: prop.verified,
      location: prop.location,
    };
  }

  async create(dto: CreatePropertyDto, userId?: string) {
    const newProperty: PropertyRecord = {
      id: `prop-${Date.now()}`,
      title: dto.title,
      description: dto.description,
      listingType: dto.listingType,
      propertyType: dto.propertyType,
      status: PropertyStatusEnum.SUBMITTED, // Starts in SUBMITTED queue for Admin Review
      price: dto.price,
      priceLabel:
        dto.priceLabel ||
        (dto.price >= 10000000
          ? `₹${(dto.price / 10000000).toFixed(2)} Cr`
          : dto.price >= 100000
          ? `₹${(dto.price / 100000).toFixed(2)} Lakh`
          : `₹${dto.price.toLocaleString('en-IN')}`),
      location: dto.location,
      city: dto.city,
      area: dto.area,
      bedrooms: dto.bedrooms || 0,
      bathrooms: dto.bathrooms || 0,
      furnishing: dto.furnishing || 'unfurnished',
      parking: !!dto.parking,
      deposit: dto.deposit,
      maintenance: dto.maintenance,
      images: dto.images && dto.images.length > 0
        ? dto.images
        : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      amenities: dto.amenities || ['Power Backup', 'Lift', 'Security'],
      verified: false,
      featured: false,
      ownerId: userId,
      ownerName: dto.ownerName,
      ownerPhone: dto.ownerPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.properties.unshift(newProperty);
    return newProperty;
  }
}
