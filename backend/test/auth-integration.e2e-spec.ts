import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Authentication & Access Control Integration Tests', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  const testPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
  let registeredToken = '';
  let refreshToken = '';

  it('1. Public access: Unauthenticated guest can browse property listings', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/properties')
      .expect(200);

    expect(res.body.properties).toBeDefined();
    expect(Array.isArray(res.body.properties)).toBe(true);
  });

  it('2. Protected route: Owner contact details blocked without token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/properties/prop-buy-1/owner')
      .expect(401);
  });

  it('3. Mobile OTP: Send OTP via MSG91 to new mobile number', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/send-otp')
      .send({ identifier: testPhone })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.isExistingUser).toBe(false);
    expect(res.body.mobile).toBe(testPhone);
  });

  it('3b. Mobile OTP: Resend OTP via MSG91', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/resend-otp')
      .send({ identifier: testPhone })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.mobile).toBe(testPhone);
  });

  it('3c. Mobile OTP: Rejects invalid or mismatched OTP', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ identifier: testPhone, otp: '999999' })
      .expect(401);
  });

  it('4. New user verification: Returns isNewUser=true when no name provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ identifier: testPhone, otp: '123456' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.isNewUser).toBe(true);
    expect(res.body.phone).toBe(testPhone);
    expect(res.body.accessToken).toBeDefined();
  });

  it('5. New user completion: Register with full name', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/complete-signup')
      .send({
        name: 'Kavitha Reddy',
        phone: testPhone,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Kavitha Reddy');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    registeredToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('6. Existing user flow: Sending OTP recognizes existing user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/send-otp')
      .send({ identifier: testPhone })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.isExistingUser).toBe(true);
  });

  it('7. Existing user verification: Logs in directly with JWT tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ identifier: testPhone, otp: '123456' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.isNewUser).toBe(false);
    expect(res.body.user.name).toBe('Kavitha Reddy');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('8. Google Sign-In: Authenticate or register with Google', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({
        email: 'rahul.google.test@gmail.com',
        name: 'Rahul Google User',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('rahul.google.test@gmail.com');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    // Verify existing user logging in again does not create duplicate
    const resExisting = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({
        email: 'rahul.google.test@gmail.com',
        name: 'Rahul Google User',
      })
      .expect(200);

    expect(resExisting.body.user.id).toBe(res.body.user.id);

    // Verify profile API works with Google token
    const profileRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .expect(200);

    expect(profileRes.body.email).toBe('rahul.google.test@gmail.com');
  });

  it('8b. Google Sign-In: Rejects invalid or empty credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ idToken: 'invalid_malformed_google_token' })
      .expect(401);
  });

  it('9. Apple Sign-In: Authenticate or register with Apple', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/apple')
      .send({
        email: 'rahul.apple.test@privaterelay.appleid.com',
        name: 'Rahul Apple User',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('rahul.apple.test@privaterelay.appleid.com');
    expect(res.body.accessToken).toBeDefined();
  });

  it('10. Refresh token: Issue new access token using refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
  });

  it('11. Authenticated user profile: GET /api/v1/auth/me returns current user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registeredToken}`)
      .expect(200);

    expect(res.body.name).toBe('Kavitha Reddy');
  });

  it('12. Protected access: Owner details accessible with valid JWT token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/properties/prop-buy-1/owner')
      .set('Authorization', `Bearer ${registeredToken}`)
      .expect(200);

    expect(res.body.ownerName).toBeDefined();
  });
});
