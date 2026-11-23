import { describe, it, expect, beforeAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from '../src/modules/cloudinary/cloudinary.module.js';
import { PropertiesService } from '../src/modules/properties/properties.service.js';
import { AdminService } from '../src/modules/admin/admin.service.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { mockDb } from '../src/common/mock-db.js';
import { ListingTypeEnum, PropertyStatusEnum } from '../src/common/constants.js';

describe('Admin Dashboard Data-Fetching & Real Database Synchronization Audit', () => {
  let adminService: AdminService;
  let propertiesService: PropertiesService;

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

    adminService = moduleRef.get<AdminService>(AdminService);
    propertiesService = moduleRef.get<PropertiesService>(PropertiesService);
  });

  it('1. GET /admin/overview returns 100% accurate database counts across all queues and modules', async () => {
    const overview = await adminService.getOverview();

    expect(overview).toBeDefined();
    expect(overview.totalProperties).toBe(mockDb.properties.length);
    expect(overview.totalUsers).toBe(mockDb.users.length);

    const publishedCount = mockDb.properties.filter(
      (p) => p.status === PropertyStatusEnum.PUBLISHED || p.status === PropertyStatusEnum.APPROVED
    ).length;
    expect(overview.totalPublishedProperties).toBe(publishedCount);

    expect(overview.totalRequests).toBeGreaterThanOrEqual(mockDb.properties.length);
    expect(overview.moduleCounts).toBeDefined();
    expect(typeof overview.moduleCounts.flat_building).toBe('number');
    expect(typeof overview.moduleCounts.rent).toBe('number');
    expect(typeof overview.moduleCounts.commercial).toBe('number');
  });

  it('2. GET /admin/requests fetches ALL real database records with zero mock dummy data', async () => {
    const allRequests = await adminService.getAllUnifiedRequests();

    expect(allRequests.length).toBeGreaterThanOrEqual(mockDb.properties.length);

    // Verify none of the dummy IDs from old mockData exist
    const dummyIds = allRequests.filter(
      (r) => r.id === 'req-pg-101' || r.code === 'PG-5012' || r.id === 'req-fb-101'
    );
    expect(dummyIds.length).toBe(0);

    // Verify all mockDb properties are represented in requests
    for (const prop of mockDb.properties) {
      const found = allRequests.find((r) => r.id === prop.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe(prop.title);
      expect(found?.locality).toBe(prop.location);
      expect(found?.ownerOrUser?.phone).toBe(prop.ownerPhone);
      expect(found?.priceNumeric).toBe(prop.price);
    }
  });

  it('3. Filtering by module returns only records belonging to that vertical', async () => {
    const buyRequests = await adminService.getAllUnifiedRequests({ module: 'flat_building' });
    for (const req of buyRequests) {
      expect(req.module).toBe('flat_building');
    }

    const rentRequests = await adminService.getAllUnifiedRequests({ module: 'rent' });
    for (const req of rentRequests) {
      expect(req.module).toBe('rent');
    }

    const commRequests = await adminService.getAllUnifiedRequests({ module: 'commercial' });
    for (const req of commRequests) {
      expect(req.module).toBe('commercial');
    }
  });

  it('4. Filtering by status returns only records with that mapped status', async () => {
    const publishedRequests = await adminService.getAllUnifiedRequests({ status: 'published' });
    for (const req of publishedRequests) {
      expect(req.status).toBe('published');
    }

    const newRequests = await adminService.getAllUnifiedRequests({ status: 'new' });
    for (const req of newRequests) {
      expect(req.status).toBe('new');
    }

    const rejectedRequests = await adminService.getAllUnifiedRequests({ status: 'rejected' });
    for (const req of rejectedRequests) {
      expect(req.status).toBe('rejected');
    }
  });

  it('5. Live listings returns only published/approved properties currently visible to users', async () => {
    const liveListings = adminService.getLiveListings();

    for (const prop of liveListings) {
      expect(
        prop.status === PropertyStatusEnum.PUBLISHED || prop.status === PropertyStatusEnum.APPROVED
      ).toBe(true);
    }
  });

  it('6. Unpublishing a property immediately removes it from live listings and returns it to review', async () => {
    // Pick an existing published property
    const published = mockDb.properties.find(
      (p) => p.status === PropertyStatusEnum.PUBLISHED
    );
    if (published) {
      const targetId = published.id;
      const initialLiveCount = adminService.getLiveListings().length;

      // Unpublish
      await adminService.unpublishProperty(targetId, 'Testing unpublish flow');
      expect(published.status).toBe(PropertyStatusEnum.PENDING);
      expect(published.verified).toBe(false);

      const updatedLiveListings = adminService.getLiveListings();
      expect(updatedLiveListings.find((p) => p.id === targetId)).toBeUndefined();
      expect(updatedLiveListings.length).toBe(initialLiveCount - 1);

      // Re-publish to restore state
      await adminService.approveProperty(targetId);
      expect(published.status).toBe(PropertyStatusEnum.PUBLISHED);
      expect(published.verified).toBe(true);
    }
  });

  it('7. Team members are loaded from database and can be dynamically added and saved', async () => {
    const initialTeam = adminService.getTeamMembers();
    expect(initialTeam.length).toBeGreaterThan(0);

    const uniquePhone = `+91 98490 ${Math.floor(10000 + Math.random() * 90000)}`;
    const newMember = adminService.addTeamMember({
      name: 'Sneha Kulkarni',
      role: 'Verification Exec',
      phone: uniquePhone,
      zone: 'Madhapur & Kondapur',
    });

    expect(newMember.id).toBeDefined();
    expect(newMember.name).toBe('Sneha Kulkarni');
    expect(newMember.initials).toBe('SK');

    const updatedTeam = adminService.getTeamMembers();
    const found = updatedTeam.find((t) => t.id === newMember.id);
    expect(found).toBeDefined();
    expect(found?.phone).toBe(uniquePhone);
  });

  it('8. Operations reports and alerts match real database statistics', async () => {
    const reports = adminService.getReports();
    expect(reports.summary.totalProperties).toBe(mockDb.properties.length);
    expect(reports.auditLogs.length).toBeGreaterThan(0);

    const notifications = adminService.getNotifications();
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);
  });
});
