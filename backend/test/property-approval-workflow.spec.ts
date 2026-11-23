import { describe, it, expect, beforeAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from '../src/modules/cloudinary/cloudinary.module.js';
import { PropertiesService } from '../src/modules/properties/properties.service.js';
import { AdminService } from '../src/modules/admin/admin.service.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { mockDb } from '../src/common/mock-db.js';
import { ListingTypeEnum, PropertyStatusEnum } from '../src/common/constants.js';

describe('Complete Post Property -> Admin Approval -> Public Listing Workflow', () => {
  let propertiesService: PropertiesService;
  let adminService: AdminService;

  const testOwnerPhone = '+91 99988 77665';
  const testOwnerName = 'Aditya Rao';
  let createdPropId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CloudinaryModule,
      ],
      providers: [
        PropertiesService,
        AdminService,
        PrismaService,
      ],
    }).compile();

    propertiesService = moduleRef.get<PropertiesService>(PropertiesService);
    adminService = moduleRef.get<AdminService>(AdminService);
  });

  it('1. When a user submits a property, all details, Cloudinary URLs, coordinates, and prices are immediately stored with status PENDING', async () => {
    const newListing = await propertiesService.create(
      {
        title: 'Jayabheri The Peak - 4 BHK Ultra Luxury Duplex',
        description: 'Exquisite lake-facing duplex with Italian marble and smart automation in Financial District.',
        listingType: ListingTypeEnum.BUY,
        propertyType: 'Apartment',
        price: 52000000,
        priceLabel: '₹5.20 Cr',
        location: 'Financial District',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        latitude: 17.4168,
        longitude: 78.3412,
        fullAddress: 'Tower 2, Floor 24, Jayabheri The Peak, Financial District, Hyderabad, Telangana - 500032',
        area: 4500,
        bedrooms: 4,
        bathrooms: 5,
        furnishing: 'fully-furnished',
        parking: true,
        images: [
          'https://res.cloudinary.com/wef54cpt/image/upload/v1763738096/seedha-properties/properties/test_prop_1.jpg',
          'https://res.cloudinary.com/wef54cpt/image/upload/v1763738096/seedha-properties/properties/test_prop_2.jpg',
        ],
        amenities: ['Private Elevator', 'Infinity Pool', 'Concierge Service', 'EV Charging'],
        ownerName: testOwnerName,
        ownerPhone: testOwnerPhone,
        ownerEmail: 'aditya.rao@gmail.com',
      },
      'usr_aditya_123',
    );

    expect(newListing).toBeDefined();
    expect(newListing.id).toBeDefined();
    createdPropId = newListing.id;

    // Verify status is PENDING and verified is false
    expect(newListing.status).toBe(PropertyStatusEnum.PENDING);
    expect(newListing.verified).toBe(false);

    // Verify coordinates, price, Cloudinary images are safely stored
    expect(newListing.latitude).toBe(17.4168);
    expect(newListing.longitude).toBe(78.3412);
    expect(newListing.price).toBe(52000000);
    expect(newListing.images.length).toBe(2);
    expect(newListing.images[0]).toContain('cloudinary.com');
  });

  it('2. The submitted property must NOT be visible in public listings and search results while PENDING', async () => {
    const publicList = await propertiesService.findAll({});
    const foundInPublic = publicList.properties.some((p) => p.id === createdPropId);
    expect(foundInPublic).toBe(false);

    // Also verify search by city/location does not expose it
    const searchResult = await propertiesService.findAll({ location: 'Financial District' });
    const foundInSearch = searchResult.properties.some((p) => p.id === createdPropId);
    expect(foundInSearch).toBe(false);
  });

  it('3. The submitting user CAN see their property in My Properties with Under Review status', async () => {
    const userProperties = await propertiesService.findUserProperties('usr_aditya_123');
    const myProp = userProperties.properties.find((p) => p.id === createdPropId);
    expect(myProp).toBeDefined();
    expect(myProp!.status).toBe(PropertyStatusEnum.PENDING);
    expect(myProp!.verified).toBe(false);
  });

  it('4. The newly submitted property immediately appears in the Admin Dashboard under Requests & Submissions', async () => {
    const adminRequests = await adminService.getAllUnifiedRequests({ module: 'flat_building' });
    const req = adminRequests.find((r) => r.id === createdPropId);

    expect(req).toBeDefined();
    expect(req!.status).toBe('new');
    expect(req!.module).toBe('flat_building');
    expect(req!.ownerOrUser.name).toBe(testOwnerName);
    expect(req!.ownerOrUser.phone).toBe(testOwnerPhone);
    expect(req!.priceNumeric).toBe(52000000);
    expect(req!.latitude).toBe(17.4168);
    expect(req!.longitude).toBe(78.3412);
    expect(req!.photos.length).toBe(2);
  });

  it('5. When Admin reviews and approves the property, status transitions to PUBLISHED and verified=true', async () => {
    const approveResult = adminService.approveProperty(createdPropId);
    expect(approveResult).toBeDefined();
    expect(approveResult.property.status).toBe(PropertyStatusEnum.PUBLISHED);
    expect(approveResult.property.verified).toBe(true);
    expect(approveResult.property.publishedAt).toBeDefined();
  });

  it('6. AFTER Admin accepts, the property is IMMEDIATELY visible in public listings and search results for all users', async () => {
    const publicList = await propertiesService.findAll({});
    const foundInPublic = publicList.properties.some((p) => p.id === createdPropId);
    expect(foundInPublic).toBe(true);

    const publicItem = publicList.properties.find((p) => p.id === createdPropId);
    expect(publicItem!.verified).toBe(true);
    expect(publicItem!.status).toBe(PropertyStatusEnum.PUBLISHED);
    expect(publicItem!.images[0]).toContain('cloudinary.com');

    // Also visible in filtered search
    const searchResult = await propertiesService.findAll({ location: 'Financial District' });
    const foundInSearch = searchResult.properties.some((p) => p.id === createdPropId);
    expect(foundInSearch).toBe(true);
  });

  it('7. In Admin Requests queue, status updates to published', async () => {
    const adminRequests = await adminService.getAllUnifiedRequests({ module: 'flat_building' });
    const req = adminRequests.find((r) => r.id === createdPropId);
    expect(req).toBeDefined();
    expect(req!.status).toBe('published');
  });

  it('8. When Admin rejects a property, it is removed from public view and stores rejection reason', async () => {
    const rejectReason = 'RERA documentation could not be verified with registry';
    const rejectResult = adminService.rejectProperty(createdPropId, { reason: rejectReason });

    expect(rejectResult.property.status).toBe(PropertyStatusEnum.REJECTED);
    expect(rejectResult.property.verified).toBe(false);
    expect(rejectResult.property.rejectionReason).toBe(rejectReason);

    // Ensure it is immediately hidden from public listings
    const publicListAfterReject = await propertiesService.findAll({});
    const foundInPublic = publicListAfterReject.properties.some((p) => p.id === createdPropId);
    expect(foundInPublic).toBe(false);

    // But owner can still inspect it and the rejection reason in My Properties
    const userProperties = await propertiesService.findUserProperties('usr_aditya_123');
    const myProp = userProperties.properties.find((p) => p.id === createdPropId);
    expect(myProp).toBeDefined();
    expect(myProp!.status).toBe(PropertyStatusEnum.REJECTED);
    expect(myProp!.rejectionReason).toBe(rejectReason);
  });
});
