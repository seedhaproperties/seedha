import { Injectable, NotFoundException } from '@nestjs/common';
import { mockDb, PropertyRecord } from '../../common/mock-db.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
import { ListingTypeEnum, PropertyStatusEnum } from '../../common/constants.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EventsGateway } from '../events/events.gateway.js';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventsGateway?: EventsGateway,
  ) {}

  async findAll(query: QueryPropertyDto) {
    // Only return approved and verified live listings to the public
    let results = mockDb.properties.filter(
      (p) =>
        (p.status === PropertyStatusEnum.PUBLISHED ||
          p.status === PropertyStatusEnum.APPROVED ||
          p.verified === true) &&
        p.status !== PropertyStatusEnum.REJECTED &&
        p.status !== PropertyStatusEnum.CLOSED &&
        (p.status as any) !== 'REJECTED' &&
        (p.status as any) !== 'CLOSED' &&
        (p.status as any) !== 'PENDING' &&
        (p.status as any) !== 'SUBMITTED' &&
        (p.status as any) !== 'UNDER_REVIEW',
    );

    // Deduplicate by ID to guarantee unique listings
    const seen = new Set<string>();
    results = results.filter((p) => {
      if (!p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

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

  async findUserProperties(userId?: string) {
    let list: PropertyRecord[] = [];

    if (userId) {
      list = mockDb.properties.filter((p) => p.ownerId === userId);

      const user = mockDb.users.find((u) => u.id === userId);
      if (user) {
        const uPhone = user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';
        const uEmail = user.email ? user.email.toLowerCase().trim() : '';

        const matched = mockDb.properties.filter(
          (p) =>
            (uPhone && p.ownerPhone && p.ownerPhone.replace(/\D/g, '').slice(-10) === uPhone) ||
            (uEmail && p.ownerEmail && p.ownerEmail.toLowerCase().trim() === uEmail),
        );
        for (const m of matched) {
          if (!list.some((existing) => existing.id === m.id)) {
            list.push(m);
          }
        }
      }
    }

    // Fallback: If no exact user match, return any newly submitted / pending property or properties without ownerId
    if (list.length === 0) {
      list = mockDb.properties.filter(
        (p) =>
          p.status === PropertyStatusEnum.PENDING ||
          p.status === PropertyStatusEnum.SUBMITTED ||
          p.status === PropertyStatusEnum.UNDER_REVIEW ||
          !p.ownerId,
      );
    }

    // Deduplicate user properties by ID
    const seenUserProps = new Set<string>();
    list = list.filter((p) => {
      if (!p.id || seenUserProps.has(p.id)) return false;
      seenUserProps.add(p.id);
      return true;
    });

    return {
      total: list.length,
      properties: list,
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

  async uploadImage(dto: UploadPropertyImageDto) {
    const raw =
      dto.imageBase64 ||
      dto.imageUrl ||
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';

    const uploaded = await this.cloudinaryService.uploadImage(
      raw,
      'seedha-properties/properties',
    );

    return {
      success: true,
      url: uploaded.url,
      publicId: uploaded.publicId,
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
      message: 'Property photo uploaded to Cloudinary successfully',
    };
  }

  async remove(id: string, userId?: string) {
    const idx = mockDb.properties.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const prop = mockDb.properties[idx];

    // Delete associated images from Cloudinary
    if (prop.imagePublicIds && prop.imagePublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleImages(prop.imagePublicIds);
    }

    mockDb.properties.splice(idx, 1);
    mockDb.saveToDisk();

    return {
      success: true,
      message: 'Property and associated Cloudinary images removed successfully',
    };
  }

  async deletePropertyImage(id: string, publicId: string) {
    const prop = await this.findOne(id);
    await this.cloudinaryService.deleteImage(publicId);

    // Remove from property images list
    if (prop.imagePublicIds) {
      const pIdx = prop.imagePublicIds.indexOf(publicId);
      if (pIdx !== -1) {
        prop.imagePublicIds.splice(pIdx, 1);
        if (prop.images && prop.images[pIdx]) {
          prop.images.splice(pIdx, 1);
        }
      }
    } else if (prop.images) {
      prop.images = prop.images.filter((img) => !img.includes(publicId));
    }

    mockDb.saveToDisk();
    return {
      success: true,
      message: 'Property image deleted from Cloudinary successfully',
      property: prop,
    };
  }

  async create(dto: CreatePropertyDto, userId?: string) {
    let resolvedOwnerId = userId;
    if (!resolvedOwnerId && dto.ownerPhone) {
      const cleanPhone = dto.ownerPhone.replace(/\D/g, '').slice(-10);
      const u = mockDb.users.find(
        (usr) => usr.phone && usr.phone.replace(/\D/g, '').slice(-10) === cleanPhone,
      );
      if (u) resolvedOwnerId = u.id;
    }

    // Process and upload images to Cloudinary (NEVER store binary data in the database)
    const processedImages: string[] = [];
    const imagePublicIds: string[] = [];

    const rawImagesList = dto.images && Array.isArray(dto.images) && dto.images.length > 0
      ? dto.images
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'];

    for (const img of rawImagesList) {
      if (typeof img === 'string' && img.trim() !== '') {
        if (img.startsWith('data:image/')) {
          // Upload base64 to Cloudinary
          const uploaded = await this.cloudinaryService.uploadImage(
            img,
            'seedha-properties/properties',
          );
          processedImages.push(uploaded.url);
          imagePublicIds.push(uploaded.publicId);
        } else {
          // It is already a URL
          processedImages.push(img);
          // Extract publicId if it's a Cloudinary URL
          if (img.includes('cloudinary.com')) {
            const parts = img.split('/upload/');
            if (parts.length > 1) {
              const pid = parts[1].replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
              imagePublicIds.push(pid);
            }
          }
        }
      }
    }

    // Cleanse details so no image binary / base64 is persisted in details
    const sanitizedDetails = { ...(dto.details || {}) };
    if (sanitizedDetails.photos && Array.isArray(sanitizedDetails.photos)) {
      sanitizedDetails.photos = [];
    }

    // Avoid duplicate listings: if user already posted this exact property, update it
    const cleanPhone = (dto.ownerPhone || '').replace(/\D/g, '').slice(-10);
    const existingIdx = mockDb.properties.findIndex(
      (p) =>
        p.title.trim().toLowerCase() === dto.title.trim().toLowerCase() &&
        cleanPhone &&
        p.ownerPhone &&
        p.ownerPhone.replace(/\D/g, '').slice(-10) === cleanPhone &&
        p.location.trim().toLowerCase() === dto.location.trim().toLowerCase(),
    );

    if (existingIdx !== -1) {
      const existing = mockDb.properties[existingIdx];
      existing.price = dto.price;
      existing.priceLabel = dto.priceLabel || existing.priceLabel;
      existing.description = dto.description || existing.description;
      existing.images = processedImages.length > 0 ? processedImages : existing.images;
      existing.imagePublicIds = imagePublicIds.length > 0 ? imagePublicIds : existing.imagePublicIds;
      existing.status = PropertyStatusEnum.PENDING;
      existing.verified = false;
      existing.updatedAt = new Date().toISOString();
      mockDb.saveToDisk();
      return existing;
    }

    const newProperty: PropertyRecord = {
      id: `prop-${Date.now()}`,
      title: dto.title,
      description: dto.description,
      listingType: dto.listingType,
      propertyType: dto.propertyType,
      status: PropertyStatusEnum.PENDING, // Submitted for Admin Review
      verified: false, // Remains unverified until Admin accepts
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
      state: dto.state,
      pincode: dto.pincode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      fullAddress: dto.fullAddress,
      area: dto.area,
      bedrooms: dto.bedrooms || 0,
      bathrooms: dto.bathrooms || 0,
      furnishing: dto.furnishing || 'unfurnished',
      parking: !!dto.parking,
      deposit: dto.deposit,
      maintenance: dto.maintenance,
      facing: dto.facing,
      floor: dto.floor,
      totalFloors: dto.totalFloors,
      images: processedImages,
      imagePublicIds,
      amenities: dto.amenities || ['Power Backup', 'Lift', 'Security'],
      featured: false,
      ownerId: resolvedOwnerId,
      ownerName: dto.ownerName,
      ownerPhone: dto.ownerPhone,
      ownerEmail: dto.ownerEmail,
      views: 0,
      leads: 0,
      details: sanitizedDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.properties.unshift(newProperty);

    // Increment user properties count in mock store
    if (resolvedOwnerId) {
      const user = mockDb.users.find((u) => u.id === resolvedOwnerId);
      if (user) {
        if (!user.summary) {
          user.summary = { savedCount: 3, activityCount: 14, propertiesCount: 0, servicesCount: 4 };
        }
        user.summary.propertiesCount = (user.summary.propertiesCount || 0) + 1;
      }
    }

    mockDb.saveToDisk();

    // Real-time Socket.IO emission to authenticated admin clients
    if (this.eventsGateway) {
      try {
        this.eventsGateway.emitPropertyCreated(newProperty);
      } catch (err: any) {
        // Socket emission safety
      }
    }

    return newProperty;
  }
}
