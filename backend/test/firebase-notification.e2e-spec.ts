import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/database/prisma.service.js';

describe('Firebase Cloud Messaging (FCM) Notification Module - Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;

  const testPhone1 = '+919988112233';
  const testPhone2 = '+919988445566';
  const sampleFcmToken1 = 'fcm_device_token_android_alpha_' + Date.now();
  const sampleFcmToken2 = 'fcm_device_token_tablet_beta_' + Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    // Create User 1 via OTP flow
    await request(app.getHttpServer())
      .post('/api/v1/auth/send-otp')
      .send({ phone: testPhone1 });

    const verify1 = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ identifier: testPhone1, otp: '123456', name: 'Notification User 1' });

    user1Token = verify1.body.accessToken;
    user1Id = verify1.body.user.id;

    // Create User 2 via OTP flow
    await request(app.getHttpServer())
      .post('/api/v1/auth/send-otp')
      .send({ phone: testPhone2 });

    const verify2 = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ identifier: testPhone2, otp: '123456', name: 'Notification User 2' });

    user2Token = verify2.body.accessToken;
    user2Id = verify2.body.user.id;
  });

  afterAll(async () => {
    // Clean up test records
    await prisma.deviceToken.deleteMany({
      where: { userId: { in: [user1Id, user2Id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [user1Id, user2Id] } },
    });
    await app.close();
  });

  it('1. Security: Block unauthenticated requests to notification endpoints', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/notifications/device-token')
      .send({ token: 'sample_token', platform: 'android' });

    expect(res.status).toBe(401);
  });

  it('2. Register FCM Device Token for authenticated user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/notifications/device-token')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        token: sampleFcmToken1,
        platform: 'android',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.deviceTokenId).toBeDefined();

    // Verify token exists in database
    const dbToken = await prisma.deviceToken.findUnique({
      where: { token: sampleFcmToken1 },
    });
    expect(dbToken).not.toBeNull();
    expect(dbToken?.userId).toBe(user1Id);
    expect(dbToken?.platform).toBe('android');
  });

  it('3. Multiple devices per user: Register second device for same user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/notifications/device-token')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        token: sampleFcmToken2,
        platform: 'ios',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify user now has 2 registered devices
    const userDevices = await prisma.deviceToken.findMany({
      where: { userId: user1Id },
    });
    expect(userDevices.length).toBe(2);
  });

  it('4. Duplicate token registration: Re-registering existing token updates rather than duplicates', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/notifications/device-token')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        token: sampleFcmToken1,
        platform: 'android',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const tokens = await prisma.deviceToken.findMany({
      where: { token: sampleFcmToken1 },
    });
    expect(tokens.length).toBe(1);
  });

  it('5. Query registered devices: GET /api/v1/notifications/my-devices', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications/my-devices')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('6. Send push notification to target user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/notifications/send-to-user')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        userId: user1Id,
        title: 'Site Visit Confirmed! 🏡',
        body: 'Your visit has been confirmed by the owner for tomorrow.',
        data: { propertyId: 'prop_test_123', screen: 'visit_details' },
      });

    expect(res.status).toBe(200);
    expect(res.body.totalDevices).toBe(2);
    // In live mode with mock tokens, Google FCM returns failureCount; in simulation mode success is true
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.sentCount + res.body.failureCount).toBe(2);
  });

  it('7. Send multicast notification to multiple users', async () => {
    // Register token for user 2
    await request(app.getHttpServer())
      .post('/api/v1/notifications/device-token')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        token: 'fcm_user_2_device_' + Date.now(),
        platform: 'android',
      });

    const res = await request(app.getHttpServer())
      .post('/api/v1/notifications/send-multicast')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        userIds: [user1Id, user2Id],
        title: 'New Featured Property Listed! ✨',
        body: 'A luxury 3 BHK flat in Gachibowli was just published.',
        data: { propertyId: 'prop_featured_01' },
      });

    expect(res.status).toBe(200);
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.totalDevices).toBeGreaterThanOrEqual(3);
    expect(res.body.sentCount + res.body.failureCount).toBeGreaterThanOrEqual(3);
  });

  it('8. Unregister device token upon user logout', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/notifications/device-token/unregister')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ token: sampleFcmToken2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const remaining = await prisma.deviceToken.findMany({
      where: { userId: user1Id },
    });
    expect(remaining.length).toBe(1);
    expect(remaining[0].token).toBe(sampleFcmToken1);
  });
});
