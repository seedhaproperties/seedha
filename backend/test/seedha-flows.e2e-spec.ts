import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Seedha Properties - Workflows E2E Test Suite', () => {
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

  describe('Section 1 - User Workflows', () => {
    it('Flow A & B & C: Should search and filter properties', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/properties')
        .query({ city: 'Hyderabad' })
        .expect(200);

      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.properties)).toBe(true);
    });

    it('Flow A & B: Should fetch owner details and book a visit with duplicate prevention', async () => {
      // 1. Get owner details
      const ownerRes = await request(app.getHttpServer())
        .get('/api/v1/properties/prop-buy-1/owner')
        .expect(200);
      expect(ownerRes.body.ownerName).toBeDefined();

      // 2. Book visit
      const visitPayload = {
        date: '2026-11-05',
        timeSlot: '11:00 AM - 12:00 PM',
        userName: 'Rahul Tester',
        userPhone: '+919999988888',
        notes: 'First visit for inspection',
      };

      const bookRes = await request(app.getHttpServer())
        .post('/api/v1/properties/prop-buy-1/visits')
        .send(visitPayload)
        .expect(201);

      expect(bookRes.body.visit.id).toBeDefined();
      expect(bookRes.body.visit.status).toBe('CONFIRMED');

      // 3. Duplicate visit booking attempt should be prevented
      await request(app.getHttpServer())
        .post('/api/v1/properties/prop-buy-1/visits')
        .send(visitPayload)
        .expect(409);

      // 4. Submit optional rating
      const ratingRes = await request(app.getHttpServer())
        .post(`/api/v1/site-visits/${bookRes.body.visit.id}/rating`)
        .send({ rating: 5, ratingComment: 'Smooth booking and great response!' })
        .expect(201);

      expect(ratingRes.body.visit.rating).toBe(5);
    });

    it('Flow D: Should submit Property Management flat details by owner', async () => {
      const pmRes = await request(app.getHttpServer())
        .post('/api/v1/property-management/requests')
        .send({
          ownerName: 'Suresh Landlord',
          ownerPhone: '+919876500000',
          flatDetails: '3 BHK, Flat 802, Prestige Tower',
          address: 'Gachibowli, Hyderabad',
          city: 'Hyderabad',
          locality: 'Gachibowli',
          serviceRequested: 'Tenant Search & Complete Maintenance',
        })
        .expect(201);

      expect(pmRes.body.request.id).toBeDefined();
      expect(pmRes.body.request.status).toBe('SUBMITTED');
      expect(pmRes.body.request.locationMatched).toBe(true);
    });

    it('Flow E: Should calculate home loan EMI, eligibility, compare banks, and request assistance', async () => {
      // EMI calculation
      const emiRes = await request(app.getHttpServer())
        .post('/api/v1/home-loans/calculate')
        .send({
          loanAmount: 5000000,
          interestRate: 8.5,
          tenureYears: 20,
          monthlyIncome: 120000,
          existingEmi: 0,
        })
        .expect(201);

      expect(emiRes.body.monthlyEmi).toBeGreaterThan(40000);
      expect(emiRes.body.indicativeEligibility.isEligibleForRequestedAmount).toBe(true);

      // Compare banks
      const banksRes = await request(app.getHttpServer())
        .get('/api/v1/home-loans/compare-banks')
        .expect(200);
      expect(banksRes.body.length).toBeGreaterThanOrEqual(3);

      // Request assistance
      const loanReqRes = await request(app.getHttpServer())
        .post('/api/v1/home-loans/assistance')
        .send({
          userName: 'Rahul',
          userPhone: '+919876543210',
          loanType: 'Home Purchase Loan',
          propertyCost: 7500000,
          loanAmount: 5000000,
          tenureYears: 20,
          monthlyIncome: 120000,
          calculatedEmi: emiRes.body.monthlyEmi,
          selectedBank: 'HDFC Bank',
        })
        .expect(201);

      expect(loanReqRes.body.request.id).toBeDefined();
      expect(loanReqRes.body.request.status).toBe('REQUESTED');
    });

    it('Flow F: Should generate Rental Agreement preview, place order, and verify payment', async () => {
      const details = {
        landlordName: 'Ramesh Gupta',
        landlordPhone: '+919888877777',
        landlordAddress: 'Jubilee Hills, Hyderabad',
        tenantName: 'Rahul Sharma',
        tenantPhone: '+919876543210',
        tenantAddress: 'Madhapur, Hyderabad',
        propertyAddress: 'Flat 101, Cyber Heights, Madhapur, Hyderabad',
        monthlyRent: 28000,
        securityDeposit: 84000,
        leaseTermMonths: 11,
        agreementStartDate: '2026-11-01',
      };

      // Preview
      const previewRes = await request(app.getHttpServer())
        .post('/api/v1/rental-agreements/preview')
        .send(details)
        .expect(201);

      expect(previewRes.body.price).toBe(999);
      expect(previewRes.body.previewContent).toContain('RESIDENTIAL RENTAL AGREEMENT');

      // Order
      const orderRes = await request(app.getHttpServer())
        .post('/api/v1/rental-agreements/order')
        .send({
          details,
          payment: {
            paymentTxnId: 'txn_mock_rent_001',
            paymentAmount: 999,
          },
        })
        .expect(201);

      expect(orderRes.body.order.status).toBe('PAID');
    });

    it('Flow G & B: Should request Owner Background Verification, pay fee, and get digital report', async () => {
      // 1. Request verification
      const reqRes = await request(app.getHttpServer())
        .post('/api/v1/owner-background')
        .send({
          flatNumber: 'Flat 402',
          buildingName: 'Prestige High Fields',
          propertyAddress: 'Financial District, Nanakramguda',
          city: 'Hyderabad',
          ownerName: 'Kishore Kothari',
          ownerPhone: '+919885011223',
        })
        .expect(201);

      expect(reqRes.body.fee).toBe(499);
      const bgId = reqRes.body.request.id;

      // 2. Pay money
      const payRes = await request(app.getHttpServer())
        .post(`/api/v1/owner-background/${bgId}/pay`)
        .send({
          paymentTxnId: 'txn_bg_mock_123',
          paymentAmount: 499,
        })
        .expect(201);

      expect(payRes.body.record.status).toBe('SENT_DIGITALLY');

      // 3. View Report
      const reportRes = await request(app.getHttpServer())
        .get(`/api/v1/owner-background/${bgId}/report`)
        .expect(200);

      expect(reportRes.body.verificationChecklist.ownershipTitleDeed).toBe('VERIFIED');
    });
  });

  describe('Section 2 - Admin Operations & Queues', () => {
    it('Should fetch admin overview with queue counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/overview')
        .expect(200);

      expect(res.body.totalPublishedProperties).toBeGreaterThanOrEqual(1);
    });

    it('Admin Flow 1 & 2 & 3: Assign field work and verify & publish property listing', async () => {
      // Owner submits a new property listing first
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/properties')
        .send({
          title: 'Brand New 3 BHK in Madhapur',
          description: 'Ready to move flat near Durgam Cheruvu metro',
          listingType: 'BUY',
          propertyType: 'apartment',
          price: 13500000,
          location: 'Madhapur',
          city: 'Hyderabad',
          area: 1750,
          bedrooms: 3,
          bathrooms: 3,
          ownerName: 'Mohan Kumar',
          ownerPhone: '+919777766666',
        })
        .expect(201);

      const propId = createRes.body.id;
      expect(createRes.body.status).toBe('SUBMITTED');

      // Admin assigns field work
      const fieldRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/properties/${propId}/assign-field-work`)
        .send({
          fieldAgentName: 'Pradeep Field Inspector',
          fieldNotes: 'Physically inspected site, verified mother deed and electrical plan.',
        })
        .expect(201);

      expect(fieldRes.body.property.status).toBe('VERIFICATION_IN_PROGRESS');

      // Admin publishes after verification
      const publishRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/properties/${propId}/verify-and-publish`)
        .expect(201);

      expect(publishRes.body.property.status).toBe('PUBLISHED');
      expect(publishRes.body.property.verified).toBe(true);
    });

    it('Admin Flow 4: Property Management location check and owner contact', async () => {
      // Submit a property management request
      const pmRes = await request(app.getHttpServer())
        .post('/api/v1/property-management/requests')
        .send({
          ownerName: 'Rao Garu',
          ownerPhone: '+919849123456',
          flatDetails: 'Villa 12, Palm Meadows',
          address: 'Kondapur, Hyderabad',
          city: 'Hyderabad',
          locality: 'Kondapur',
          serviceRequested: 'Rental Management',
        })
        .expect(201);

      const reqId = pmRes.body.request.id;

      // Admin checks location (matches)
      const locRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/property-management/${reqId}/check-location`)
        .send({ matchesLocation: true })
        .expect(201);

      expect(locRes.body.request.status).toBe('LOCATION_CHECK_PASSED');

      // Team contacts owner
      const contactRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/property-management/${reqId}/contact-owner`)
        .send({ notes: 'Explained Seedha 360 management plan, owner agreed to terms.' })
        .expect(201);

      expect(contactRes.body.request.status).toBe('OWNER_CONTACTED');
    });

    it('Admin Flow 5: Home Loan review and team direct contact', async () => {
      const loanRes = await request(app.getHttpServer())
        .post('/api/v1/home-loans/assistance')
        .send({
          userName: 'Karthik',
          userPhone: '+919988771122',
          loanType: 'Home Construction Loan',
          propertyCost: 8000000,
          loanAmount: 6000000,
          tenureYears: 20,
          monthlyIncome: 180000,
          calculatedEmi: 52000,
        })
        .expect(201);

      const loanId = loanRes.body.request.id;

      const contactRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/home-loans/${loanId}/contact-user`)
        .send({ notes: 'Initiated doorstep document verification and KYC collection.' })
        .expect(201);

      expect(contactRes.body.request.status).toBe('TEAM_CONTACTED');
    });

    it('Admin Flow 6: Rental Agreement prepare documents and send to user', async () => {
      // Place order
      const orderRes = await request(app.getHttpServer())
        .post('/api/v1/rental-agreements/order')
        .send({
          details: {
            landlordName: 'Landlord A',
            landlordPhone: '+919800000001',
            landlordAddress: 'Hyderabad',
            tenantName: 'Tenant B',
            tenantPhone: '+919800000002',
            tenantAddress: 'Hyderabad',
            propertyAddress: 'Plot 23, Madhapur',
            monthlyRent: 25000,
            securityDeposit: 75000,
            leaseTermMonths: 11,
            agreementStartDate: '2026-11-01',
          },
          payment: { paymentTxnId: 'txn_agr_test', paymentAmount: 999 },
        })
        .expect(201);

      const agrId = orderRes.body.order.id;

      const prepareRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/rental-agreements/${agrId}/prepare-and-send`)
        .send({ preparationNotes: 'Executed on e-stamp paper with legal validation.' })
        .expect(201);

      expect(prepareRes.body.agreement.status).toBe('SENT_TO_USER');
    });

    it('Admin Flow 7: Owner background check field work and digital delivery', async () => {
      const bgRes = await request(app.getHttpServer())
        .post('/api/v1/owner-background')
        .send({
          flatNumber: 'Flat 501',
          buildingName: 'Cyber Residency',
          propertyAddress: 'Hitec City',
          city: 'Hyderabad',
          ownerName: 'V. Naidu',
          ownerPhone: '+919800112233',
        })
        .expect(201);

      const checkId = bgRes.body.request.id;

      // Assign field work
      await request(app.getHttpServer())
        .post(`/api/v1/admin/owner-background/${checkId}/field-work`)
        .send({
          fieldAgentName: 'Raghav Verification Agent',
          fieldNotes: 'Checking physical occupancy and society register.',
        })
        .expect(201);

      // Collect details and send digitally
      const sendRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/owner-background/${checkId}/collect-and-send-digital`)
        .send({
          summary: 'Clear title confirmed with GHMC and registrar.',
          ownershipVerified: true,
          legalDisputeClear: true,
        })
        .expect(201);

      expect(sendRes.body.check.status).toBe('SENT_DIGITALLY');
    });
  });
});
