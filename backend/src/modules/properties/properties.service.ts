import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { mockDb, PropertyRecord } from '../../common/mock-db.js';
import { CreatePropertyDto, QueryPropertyDto, UploadPropertyImageDto } from './properties.dto.js';
import { ListingTypeEnum, PropertyStatusEnum } from '../../common/constants.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EventsGateway } from '../events/events.gateway.js';

export const SERVICEABLE_LOCALITIES = [
  { locality: 'Madhapur', city: 'Hyderabad', pincode: '500081', lat: 17.4483, lng: 78.3915 },
  { locality: 'Gachibowli', city: 'Hyderabad', pincode: '500032', lat: 17.4401, lng: 78.3489 },
  { locality: 'Kondapur', city: 'Hyderabad', pincode: '500084', lat: 17.4699, lng: 78.3578 },
  { locality: 'Hitec City', city: 'Hyderabad', pincode: '500081', lat: 17.4435, lng: 78.3772 },
  { locality: 'Jubilee Hills', city: 'Hyderabad', pincode: '500033', lat: 17.4319, lng: 78.4073 },
  { locality: 'Banjara Hills', city: 'Hyderabad', pincode: '500034', lat: 17.4156, lng: 78.4358 },
  { locality: 'Financial District', city: 'Hyderabad', pincode: '500032', lat: 17.4159, lng: 78.3427 },
  { locality: 'Madhurawada', city: 'Vizag', pincode: '530048', lat: 17.8015, lng: 83.3524 },
  { locality: 'Gajuwaka', city: 'Vizag', pincode: '530026', lat: 17.6908, lng: 83.2104 },
  { locality: 'Whitefield', city: 'Bengaluru', pincode: '560066', lat: 12.9698, lng: 77.7500 },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventsGateway?: EventsGateway,
  ) {}

  async findAll(query: QueryPropertyDto) {
    try {
      let typeWhere: any = {};
      if (query.type) {
        const qTypeLower = (query.type || '').trim().toLowerCase();
        if (qTypeLower === 'pg' || qTypeLower === 'hostel' || qTypeLower === 'coliving') {
          typeWhere = {
            OR: [
              { propertyType: { in: ['pg', 'hostel', 'coliving', 'PG', 'HOSTEL', 'COLIVING', 'PG / Hostel'] } },
              { listingType: 'PG' },
              { listingType: 'HOSTEL' },
            ],
          };
        } else if (qTypeLower === 'flatmate' || qTypeLower === 'flatmates') {
          typeWhere = {
            OR: [
              { propertyType: { in: ['flatmate', 'flatmates', 'FLATMATE', 'FLATMATES', 'Flatmate', 'roommate', 'Roommate'] } },
              { listingType: 'FLATMATE' },
            ],
          };
        } else if (qTypeLower === 'commercial') {
          typeWhere = {
            OR: [
              { listingType: 'COMMERCIAL' },
              { propertyType: { in: ['commercial', 'Commercial', 'COMMERCIAL', 'shop', 'Shop', 'office', 'Office', 'showroom', 'Showroom', 'warehouse', 'Warehouse', 'industrial', 'Industrial'] } },
            ],
          };
        } else if (qTypeLower === 'buy') {
          typeWhere = {
            listingType: 'BUY',
            NOT: {
              propertyType: {
                in: [
                  'commercial', 'Commercial', 'COMMERCIAL',
                  'shop', 'Shop', 'office', 'Office',
                  'showroom', 'Showroom', 'warehouse', 'Warehouse', 'industrial', 'Industrial',
                  'pg', 'PG', 'hostel', 'Hostel', 'coliving', 'Coliving', 'PG / Hostel',
                  'flatmate', 'Flatmate', 'flatmates', 'Flatmates', 'roommate', 'Roommate',
                ],
              },
            },
          };
        } else if (qTypeLower === 'rent') {
          typeWhere = {
            listingType: 'RENT',
            NOT: {
              propertyType: {
                in: [
                  'commercial', 'Commercial', 'COMMERCIAL',
                  'shop', 'Shop', 'office', 'Office',
                  'showroom', 'Showroom', 'warehouse', 'Warehouse', 'industrial', 'Industrial',
                  'pg', 'PG', 'hostel', 'Hostel', 'coliving', 'Coliving', 'PG / Hostel',
                  'flatmate', 'Flatmate', 'flatmates', 'Flatmates', 'roommate', 'Roommate',
                ],
              },
            },
          };
        } else {
          const upper = query.type.trim().toUpperCase();
          typeWhere = { listingType: upper };
        }
      }

      // 1. Fetch from Supabase PostgreSQL if connected
      let dbProps: any[] = [];
      if (this.prisma?.isConnected) {
        try {
          dbProps = await Promise.race([
            this.prisma.property.findMany({
              where: {
                status: 'PUBLISHED',
                ...typeWhere,
                ...(query.city ? { city: { contains: query.city, mode: 'insensitive' } } : {}),
                ...(query.location ? { location: { contains: query.location, mode: 'insensitive' } } : {}),
                ...(query.pincode ? { pincode: { contains: query.pincode } } : {}),
                ...(query.propertyType && !typeWhere.propertyType ? { propertyType: { equals: query.propertyType, mode: 'insensitive' } } : {}),
                ...(query.bhk ? { bedrooms: Number(query.bhk) } : {}),
                ...(query.minPrice !== undefined ? { price: { gte: Number(query.minPrice) } } : {}),
                ...(query.maxPrice !== undefined ? { price: { lte: Number(query.maxPrice) } } : {}),
              },
            }),
            new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('Prisma timeout')), 8000)),
          ]);
        } catch {
          dbProps = [];
        }
      }

      // Combine with mockDb to ensure full catalog coverage
      let results: any[] = [...dbProps];
      const existingIds = new Set(results.map((p) => p.id));

      let mockFiltered = mockDb.properties.filter(
        (p) =>
          !existingIds.has(p.id) &&
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

      if (query.type) {
        const qTypeLower = query.type.toLowerCase().trim();
        if (qTypeLower === 'pg' || qTypeLower === 'hostel' || qTypeLower === 'coliving') {
          mockFiltered = mockFiltered.filter((p) => {
            const pt = (p.propertyType || '').toLowerCase();
            const title = (p.title || '').toLowerCase();
            return (
              ['pg', 'hostel', 'coliving', 'pg / hostel'].includes(pt) ||
              title.includes('pg') ||
              title.includes('hostel') ||
              (p as any).pgCategory !== undefined ||
              (p as any).details?.pgAccommodationType !== undefined
            );
          });
        } else if (qTypeLower === 'flatmate' || qTypeLower === 'flatmates') {
          mockFiltered = mockFiltered.filter((p) => {
            const pt = (p.propertyType || '').toLowerCase();
            const title = (p.title || '').toLowerCase();
            return (
              pt.includes('flatmate') ||
              title.includes('flatmate') ||
              (p as any).roomType !== undefined ||
              (p as any).details?.flatmateName !== undefined
            );
          });
        } else if (qTypeLower === 'buy') {
          mockFiltered = mockFiltered.filter((p) => {
            const lt = (p.listingType || '').toLowerCase();
            const pt = (p.propertyType || '').toLowerCase();
            const isCommercial = ['commercial', 'shop', 'office', 'showroom', 'warehouse', 'industrial'].some((x) => pt.includes(x));
            const isPgOrFlatmate = ['pg', 'hostel', 'coliving', 'flatmate'].some((x) => pt.includes(x)) || (p as any).pgCategory !== undefined || (p as any).roomType !== undefined;
            return lt === 'buy' && !isCommercial && !isPgOrFlatmate;
          });
        } else if (qTypeLower === 'rent') {
          mockFiltered = mockFiltered.filter((p) => {
            const lt = (p.listingType || '').toLowerCase();
            const pt = (p.propertyType || '').toLowerCase();
            const isCommercial = ['commercial', 'shop', 'office', 'showroom', 'warehouse', 'industrial'].some((x) => pt.includes(x));
            const isPgOrFlatmate = ['pg', 'hostel', 'coliving', 'flatmate'].some((x) => pt.includes(x)) || (p as any).pgCategory !== undefined || (p as any).roomType !== undefined;
            return lt === 'rent' && !isCommercial && !isPgOrFlatmate;
          });
        } else if (qTypeLower === 'commercial') {
          mockFiltered = mockFiltered.filter((p) => {
            const lt = (p.listingType || '').toLowerCase();
            const pt = (p.propertyType || '').toLowerCase();
            return (
              lt === 'commercial' ||
              ['commercial', 'shop', 'office', 'showroom', 'warehouse', 'industrial'].some((x) => pt.includes(x))
            );
          });
        } else {
          mockFiltered = mockFiltered.filter((p) => (p.listingType || '').toLowerCase() === qTypeLower);
        }
      }
      if (query.city) mockFiltered = mockFiltered.filter((p) => p.city.toLowerCase().includes(query.city!.toLowerCase()));
      if (query.location) mockFiltered = mockFiltered.filter((p) => p.location.toLowerCase().includes(query.location!.toLowerCase()));
      if (query.bhk) mockFiltered = mockFiltered.filter((p) => p.bedrooms === Number(query.bhk));
      if (query.minPrice !== undefined) mockFiltered = mockFiltered.filter((p) => p.price >= query.minPrice!);
      if (query.maxPrice !== undefined) mockFiltered = mockFiltered.filter((p) => p.price <= query.maxPrice!);

      results = [...results, ...mockFiltered];

      // Radius calculation & auto-expansion
      const userLat = query.userLat || 17.4401; // Default reference: Hyderabad Hitec/Gachibowli
      const userLng = query.userLng || 78.3489;
      const requestedRadius = query.radiusKm || 30;

      results = results.map((p) => {
        const pLat = p.latitude || 17.4483;
        const pLng = p.longitude || 78.38;
        const dist = calculateDistanceKm(userLat, userLng, pLat, pLng);
        const img = (p.images && p.images.length > 0 ? p.images[0] : (p as any).image) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

        const pType = (p.propertyType || '').toLowerCase();
        const pTitle = (p.title || '').toLowerCase();
        const isPg = ['pg', 'hostel', 'coliving'].includes(pType) || pTitle.includes('pg') || pTitle.includes('hostel');
        const isFlatmate = pType.includes('flatmate') || pTitle.includes('flatmate') || (p as any).roomType !== undefined;

        const pgCat = (p as any).pgCategory || (
          pTitle.includes('boy') ? 'Boys PG' :
          pTitle.includes('girl') || pTitle.includes('women') || pTitle.includes('ladies') ? 'Girls PG' :
          'Co-living'
        );
        const sharing = (p as any).sharingLabel || (
          pTitle.includes('co-living') ? 'Single, 2 & 3 Sharing' :
          pTitle.includes('single') ? 'Single & 2 Sharing' :
          '2 & 3 Sharing'
        );
        const foodInc = (p as any).foodIncluded !== undefined
          ? (p as any).foodIncluded
          : p.amenities?.some((a: string) => /food|mess|meal/i.test(a)) ?? false;
        const roomT = (p as any).roomType || (
          pTitle.includes('private') ? 'Private room' : 'Shared room'
        );

        return {
          ...p,
          listingType: (p.listingType || '').toLowerCase() as any,
          image: img,
          images: p.images && p.images.length > 0 ? p.images : [img],
          ownerAvatar: (p as any).ownerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
          ownerType: (p as any).ownerType || 'owner',
          distanceKm: dist,
          distanceLabel: `${dist} km away`,
          ...(isPg ? { pgCategory: pgCat, sharingLabel: sharing, foodIncluded: foodInc } : {}),
          ...(isFlatmate ? { roomType: roomT } : {}),
        };
      });

      // Sort all results nearest first
      results.sort((a, b) => a.distanceKm - b.distanceKm);

      // Radius calculation & auto-expansion
      let finalProps = results;
      let activeRadiusUsed = requestedRadius;

      if (requestedRadius < 9999) {
        let radiusMatched = results.filter((p) => p.distanceKm <= requestedRadius);
        if (radiusMatched.length === 0 && requestedRadius < 60) {
          radiusMatched = results.filter((p) => p.distanceKm <= 60);
          activeRadiusUsed = 60;
        }
        if (radiusMatched.length === 0 && activeRadiusUsed < 100) {
          radiusMatched = results.filter((p) => p.distanceKm <= 100);
          activeRadiusUsed = 100;
        }

        // Prioritize nearby properties first, but never discard other verified properties
        if (radiusMatched.length > 0 && radiusMatched.length < results.length) {
          const outside = results.filter((p) => p.distanceKm > activeRadiusUsed);
          finalProps = [...radiusMatched, ...outside];
        } else {
          finalProps = radiusMatched.length > 0 ? radiusMatched : results;
        }
      }

      return {
        total: finalProps.length,
        radiusUsedKm: activeRadiusUsed,
        properties: finalProps,
        data: finalProps,
      };
    } catch (err: any) {
      this.logger.error(`Error in findAll: ${err.message}`);
      return { total: 0, properties: [], data: [] };
    }
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
    try {
      const prop = await this.prisma.property.findUnique({ where: { id } });
      if (prop) return prop;
    } catch {}

    const mockProp = mockDb.properties.find((p) => p.id === id);
    if (!mockProp) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return mockProp;
  }

  async getOwnerDetails(id: string) {
    const prop: any = await this.findOne(id);
    return {
      propertyId: prop.id,
      title: prop.title,
      ownerName: prop.ownerName || 'Venkata Rao',
      ownerPhone: prop.ownerPhone || '+91 98765 43210',
      verified: Boolean(prop.verified),
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

    // Sync deletion to PostgreSQL
    if (this.prisma?.isConnected) {
      try {
        await this.prisma.property.deleteMany({ where: { id } });
      } catch (err: any) {
        this.logger.warn(`Prisma delete sync: ${err.message}`);
      }
    }

    return {
      success: true,
      message: 'Property and associated Cloudinary images removed successfully',
    };
  }

  async deletePropertyImage(id: string, publicId: string) {
    const prop: any = await this.findOne(id);
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
      prop.images = prop.images.filter((img: string) => !img.includes(publicId));
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

    const priceLabel =
      dto.priceLabel ||
      (dto.price >= 10000000
        ? `₹${(dto.price / 10000000).toFixed(2)} Cr`
        : dto.price >= 100000
        ? `₹${(dto.price / 100000).toFixed(2)} Lakh`
        : `₹${dto.price.toLocaleString('en-IN')}`);

    const newProperty: PropertyRecord = {
      id: `prop-${Date.now()}`,
      title: dto.title,
      description: dto.description,
      listingType: dto.listingType,
      propertyType: dto.propertyType,
      status: PropertyStatusEnum.PENDING, // Submitted for Admin Review
      verified: false, // Remains unverified until Admin accepts
      price: dto.price,
      priceLabel,
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

    // Sync to PostgreSQL if connected
    if (this.prisma?.isConnected) {
      try {
        const dbProp = await this.prisma.property.create({
          data: {
            title: dto.title,
            description: dto.description || '',
            listingType: dto.listingType as any,
            propertyType: dto.propertyType,
            status: 'SUBMITTED' as any,
            price: dto.price,
            priceLabel,
            location: dto.location,
            city: dto.city,
            area: dto.area || 1200,
            bedrooms: dto.bedrooms || 0,
            bathrooms: dto.bathrooms || 0,
            furnishing: dto.furnishing || 'unfurnished',
            parking: Boolean(dto.parking),
            deposit: dto.deposit || null,
            maintenance: dto.maintenance || null,
            images: processedImages,
            amenities: dto.amenities || ['Power Backup', 'Lift', 'Security'],
            ownerId: resolvedOwnerId || null,
            ownerName: dto.ownerName,
            ownerPhone: dto.ownerPhone,
          },
        });
        if (dbProp && dbProp.id) {
          newProperty.id = dbProp.id;
          mockDb.saveToDisk();
        }
      } catch (err: any) {
        this.logger.warn(`Prisma create sync fallback: ${err.message}`);
      }
    }

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

  // Toggle Save / Like / Unlike
  async toggleSave(propertyId: string, userId?: string) {
    const targetUserId = userId || 'user_guest_default';

    try {
      const existing = await this.prisma.savedProperty.findFirst({
        where: {
          userId: targetUserId,
          propertyId,
        },
      });

      if (existing) {
        await this.prisma.savedProperty.delete({ where: { id: existing.id } });
        this.logger.log(`❤️ Unliked property ${propertyId} for user ${targetUserId}`);
        return { success: true, saved: false, propertyId };
      } else {
        await this.prisma.savedProperty.create({
          data: {
            userId: targetUserId,
            propertyId,
          },
        });
        this.logger.log(`💖 Liked/Saved property ${propertyId} for user ${targetUserId}`);
        return { success: true, saved: true, propertyId };
      }
    } catch (err: any) {
      this.logger.error(`Toggle save error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async getMySaved(userId?: string) {
    const targetUserId = userId || 'user_guest_default';
    try {
      const list = await this.prisma.savedProperty.findMany({
        where: { userId: targetUserId },
        include: {
          property: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return list.map((item) => item.property);
    } catch {
      return [];
    }
  }

  getLocationSuggestions(query: string) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return SERVICEABLE_LOCALITIES.slice(0, 6).map((item) => ({
        ...item,
        fullLabel: `${item.locality}, ${item.city} - ${item.pincode}`,
      }));
    }

    const matched = SERVICEABLE_LOCALITIES.filter(
      (item) =>
        item.locality.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.pincode.includes(q)
    );

    return matched.map((item) => ({
      ...item,
      fullLabel: `${item.locality}, ${item.city} - ${item.pincode}`,
    }));
  }
}
