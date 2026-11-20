import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { mockDb, PropertyRecord } from '../../common/mock-db.js';
import { CreatePropertyDto, QueryPropertyDto } from './properties.dto.js';
import { ListingTypeEnum, PropertyStatusEnum } from '../../common/constants.js';

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

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPropertyDto) {
    try {
      let listingTypeEnum: any = undefined;
      if (query.type) {
        const upper = query.type.trim().toUpperCase();
        if (upper === 'BUY' || upper === 'RENT' || upper === 'COMMERCIAL') {
          listingTypeEnum = upper;
        }
      }

      // 1. Fetch from Supabase PostgreSQL
      const dbProps = await this.prisma.property.findMany({
        where: {
          status: 'PUBLISHED',
          ...(listingTypeEnum ? { listingType: listingTypeEnum } : {}),
          ...(query.city ? { city: { contains: query.city, mode: 'insensitive' } } : {}),
          ...(query.location ? { location: { contains: query.location, mode: 'insensitive' } } : {}),
          ...(query.pincode ? { pincode: { contains: query.pincode } } : {}),
          ...(query.propertyType ? { propertyType: { equals: query.propertyType, mode: 'insensitive' } } : {}),
          ...(query.bhk ? { bedrooms: Number(query.bhk) } : {}),
          ...(query.minPrice !== undefined ? { price: { gte: Number(query.minPrice) } } : {}),
          ...(query.maxPrice !== undefined ? { price: { lte: Number(query.maxPrice) } } : {}),
        },
      });

      // Combine with mockDb to ensure full catalog coverage
      let results: any[] = [...dbProps];
      const existingIds = new Set(results.map((p) => p.id));

      let mockFiltered = mockDb.properties.filter((p) => !existingIds.has(p.id));
      if (query.type) {
        const qTypeLower = query.type.toLowerCase();
        mockFiltered = mockFiltered.filter((p) => p.listingType.toLowerCase() === qTypeLower);
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
        return {
          ...p,
          listingType: (p.listingType || '').toLowerCase() as any,
          image: img,
          images: p.images && p.images.length > 0 ? p.images : [img],
          ownerAvatar: (p as any).ownerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
          ownerType: (p as any).ownerType || 'owner',
          distanceKm: dist,
          distanceLabel: `${dist} km away`,
        };
      });

      // If user specified radius, filter or prioritize
      let radiusMatched = results.filter((p) => p.distanceKm <= requestedRadius);

      // Auto-expansion logic: If 0 or very few in 30km, expand to 60km, then 100km
      let activeRadiusUsed = requestedRadius;
      if (radiusMatched.length === 0 && requestedRadius < 60) {
        radiusMatched = results.filter((p) => p.distanceKm <= 60);
        activeRadiusUsed = 60;
      }
      if (radiusMatched.length === 0 && activeRadiusUsed < 100) {
        radiusMatched = results.filter((p) => p.distanceKm <= 100);
        activeRadiusUsed = 100;
      }

      const finalProps = radiusMatched.length > 0 ? radiusMatched : results;

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

  async create(dto: CreatePropertyDto, userId?: string) {
    try {
      const priceLabel =
        dto.priceLabel ||
        (dto.price >= 10000000
          ? `₹${(dto.price / 10000000).toFixed(2)} Cr`
          : dto.price >= 100000
          ? `₹${(dto.price / 100000).toFixed(2)} Lakh`
          : `₹${dto.price.toLocaleString('en-IN')}`);

      const created = await this.prisma.property.create({
        data: {
          title: dto.title,
          description: dto.description,
          listingType: dto.listingType as any,
          propertyType: dto.propertyType,
          status: 'SUBMITTED',
          price: dto.price,
          priceLabel,
          location: dto.location,
          city: dto.city,
          area: dto.area,
          bedrooms: dto.bedrooms || 0,
          bathrooms: dto.bathrooms || 0,
          furnishing: dto.furnishing || 'unfurnished',
          parking: Boolean(dto.parking),
          deposit: dto.deposit || null,
          maintenance: dto.maintenance || null,
          images: dto.images && dto.images.length > 0 ? dto.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
          amenities: dto.amenities || ['Power Backup', 'Lift', 'Security'],
          ownerId: userId || null,
          ownerName: dto.ownerName,
          ownerPhone: dto.ownerPhone,
        },
      });

      return created;
    } catch (err: any) {
      this.logger.error(`Database property create fallback: ${err.message}`);
      return null;
    }
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
