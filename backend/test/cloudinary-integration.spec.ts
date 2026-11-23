import { describe, it, expect, beforeAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from '../src/modules/cloudinary/cloudinary.module.js';
import { CloudinaryService } from '../src/modules/cloudinary/cloudinary.service.js';
import { PropertiesService } from '../src/modules/properties/properties.service.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../src/modules/email/email.module.js';
import { Msg91Service } from '../src/modules/auth/msg91.service.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { mockDb } from '../src/common/mock-db.js';
import { ListingTypeEnum } from '../src/common/constants.js';

describe('Cloudinary Integration & Image Storage (E2E / Service)', () => {
  let cloudinaryService: CloudinaryService;
  let propertiesService: PropertiesService;
  let authService: AuthService;

  // A tiny valid 1x1 transparent PNG base64
  const sampleBase64Png =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CloudinaryModule,
        EmailModule,
        JwtModule.register({ secret: 'test_jwt_secret', signOptions: { expiresIn: '7d' } }),
      ],
      providers: [
        PropertiesService,
        AuthService,
        Msg91Service,
        PrismaService,
      ],
    }).compile();

    cloudinaryService = moduleRef.get<CloudinaryService>(CloudinaryService);
    propertiesService = moduleRef.get<PropertiesService>(PropertiesService);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('1. Cloudinary Single & Multiple Image Uploads', () => {
    it('should upload a single image and return secure Cloudinary URL and publicId', async () => {
      const res = await cloudinaryService.uploadImage(
        sampleBase64Png,
        'seedha-properties/test',
      );

      expect(res).toBeDefined();
      expect(res.url).toBeDefined();
      expect(res.url).toContain('cloudinary.com');
      expect(res.publicId).toBeDefined();
      expect(res.publicId).toContain('seedha-properties/test');
      expect(res.url.startsWith('data:')).toBe(false); // Never returns base64
    });

    it('should upload multiple images in parallel and return arrays of URLs and publicIds', async () => {
      const images = [sampleBase64Png, sampleBase64Png];
      const res = await cloudinaryService.uploadMultipleImages(
        images,
        'seedha-properties/test-multi',
      );

      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(2);
      expect(res[0].url).toContain('cloudinary.com');
      expect(res[1].publicId).toContain('seedha-properties/test-multi');
    });

    it('should accept existing remote image URLs without crashing', async () => {
      const remoteUrl =
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
      const res = await cloudinaryService.uploadImage(remoteUrl);

      expect(res.url).toBeDefined();
      expect(res.publicId).toBeDefined();
    });
  });

  describe('2. Validation & Security Limits', () => {
    it('should reject invalid image format', () => {
      expect(() => {
        cloudinaryService.validateImage('data:text/plain;base64,SGVsbG8gV29ybGQ=');
      }).toThrow('Unsupported image format');
    });

    it('should reject empty or non-string inputs', () => {
      expect(() => {
        cloudinaryService.validateImage('');
      }).toThrow('Image data or URL must be provided');
    });

    it('should enforce 10MB file size limit', () => {
      // Create a simulated 11MB base64 string
      const largeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(15 * 1024 * 1024);
      expect(() => {
        cloudinaryService.validateImage(largeBase64);
      }).toThrow('Image size exceeds maximum limit of 10MB');
    });
  });

  describe('3. Cloudinary Image Deletion', () => {
    it('should delete an image by public ID successfully', async () => {
      const uploadRes = await cloudinaryService.uploadImage(
        sampleBase64Png,
        'seedha-properties/delete-test',
      );

      const deleteRes = await cloudinaryService.deleteImage(uploadRes.publicId);
      expect(deleteRes.success).toBe(true);
      expect(deleteRes.message).toContain('deleted successfully');
    });
  });

  describe('4. Property Creation with Cloudinary (Binary Free Database)', () => {
    it('should upload base64 images to Cloudinary and store ONLY URLs and publicIds in the database', async () => {
      const newProp = await propertiesService.create({
        title: 'Cloudinary Test Villa',
        description: 'Luxury villa with Cloudinary verified photos',
        listingType: ListingTypeEnum.BUY,
        propertyType: 'Villa',
        price: 25000000,
        priceLabel: '₹2.50 Cr',
        location: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        area: 3200,
        bedrooms: 4,
        bathrooms: 4,
        ownerName: 'Test Owner',
        ownerPhone: '+919988776655',
        images: [sampleBase64Png], // Pass base64 image
        details: {
          photos: [sampleBase64Png], // Details photos that might contain base64
        },
      });

      expect(newProp).toBeDefined();
      expect(newProp.images.length).toBeGreaterThan(0);

      // Verify that database property has Cloudinary URL, NEVER base64 binary
      const firstImage = newProp.images[0];
      expect(firstImage.startsWith('data:')).toBe(false);
      expect(firstImage).toContain('cloudinary.com');

      // Verify public IDs are stored
      expect(newProp.imagePublicIds).toBeDefined();
      expect(newProp.imagePublicIds!.length).toBeGreaterThan(0);

      // Verify details photos were cleansed of binary data
      expect(newProp.details.photos.length).toBe(0);

      // Verify saved record in mockDb does not contain base64
      const inDb = mockDb.properties.find((p) => p.id === newProp.id);
      expect(inDb).toBeDefined();
      expect(inDb!.images[0].startsWith('data:')).toBe(false);
    });

    it('should remove property and clean up its Cloudinary images', async () => {
      const created = await propertiesService.create({
        title: 'Property to Delete',
        description: 'Test removal',
        listingType: ListingTypeEnum.RENT,
        propertyType: 'Flat',
        price: 35000,
        location: 'Madhapur',
        city: 'Hyderabad',
        area: 1200,
        ownerName: 'Temporary Owner',
        ownerPhone: '+919999988888',
        images: [sampleBase64Png],
      });

      const removeRes = await propertiesService.remove(created.id);
      expect(removeRes.success).toBe(true);

      const checkProp = mockDb.properties.find((p) => p.id === created.id);
      expect(checkProp).toBeUndefined();
    });
  });

  describe('5. Profile Photo (Avatar) Cloudinary Upload and Deletion', () => {
    it('should upload profile photo to Cloudinary and store URL & publicId in user record', async () => {
      const testUserId = 'usr_cloudinary_test';
      mockDb.users.push({
        id: testUserId,
        name: 'Cloudinary User',
        email: 'cloudinary@seedhaproperties.com',
        phone: '+919876543210',
        passwordHash: 'hash',
        role: 'USER' as any,
      });

      const res = await authService.uploadAvatar(testUserId, sampleBase64Png);
      expect(res.success).toBe(true);
      expect(res.avatarUrl).toBeDefined();
      expect(res.avatarUrl).toContain('cloudinary.com');
      expect(res.publicId).toBeDefined();
      expect(res.publicId).toContain('seedha-properties/avatars');

      const user = mockDb.users.find((u) => u.id === testUserId);
      expect(user?.avatarUrl).toBe(res.avatarUrl);
      expect(user?.avatarPublicId).toBe(res.publicId);

      // Now test deleting avatar from Cloudinary
      const delRes = await authService.deleteAvatar(testUserId);
      expect(delRes.success).toBe(true);
      expect(delRes.avatarUrl).toBeNull();
      expect(user?.avatarUrl).toBeUndefined();
      expect(user?.avatarPublicId).toBeUndefined();
    });
  });
});
