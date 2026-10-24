# Seedha Properties — Architecture & System Design

## 1. Executive Summary
**Seedha Properties** is an enterprise real-estate platform engineered to handle millions of users, designed strictly around two core operational blueprints:
- **Section 1: User Application Flow** (Buy Properties, Rent Homes with Background Verification decision branch, Commercial Spaces, Property Management, Home Loans, Rental Agreements, Owner Background Check)
- **Section 2: Admin Operations & Review Queues** (Pre-publication verification for Flat/Rent/Commercial listings, Location serviceability check for Property Management, Direct customer contact for Home Loans, Legal execution and digital delivery for Rental Agreements, Field investigation and digital delivery for Owner Background Verification).

---

## 2. Monorepo Repository Structure
```
seedha-properties/
├── backend/                  # NestJS TypeScript API (under /api/v1)
│   ├── src/
│   │   ├── common/           # Guards, Decorators, Constants, Mock Store
│   │   ├── database/         # PrismaService & DatabaseModule (PostgreSQL)
│   │   └── modules/
│   │       ├── auth/         # JWT Authentication & RBAC (USER, OWNER, ADMIN, FIELD_AGENT)
│   │       ├── properties/   # Listings (Buy, Rent, Commercial), Search & Details
│   │       ├── site-visits/  # Visit booking, duplicate slot prevention & ratings
│   │       ├── property-management/ # Owner flat upload & direct-to-admin routing
│   │       ├── home-loans/   # EMI calculator, bank comparison & loan assistance
│   │       ├── rental-agreements/ # Legal preview, payment & digital delivery
│   │       ├── owner-background/  # Flat/owner verification, payment & PDF delivery
│   │       └── admin/        # 7 Operational Review Queues matching Section 2
│   ├── prisma/
│   │   └── schema.prisma     # Relational PostgreSQL database models
│   └── test/
│       └── seedha-flows.e2e-spec.ts # Automated E2E test suite (13 passing tests)
│
├── frontend/                 # React Native & Expo Web Application
│   ├── src/
│   │   ├── components/       # BottomNav, PropertyCard, SeedhaLogo, etc.
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx           # Entry points for all 7 workflows + Admin Desk
│   │   │   ├── PropertyListingScreen.tsx# Buy, Rent, Commercial listings with filters
│   │   │   ├── PropertyDetailScreen.tsx # Owner details, Flow B decision branch
│   │   │   ├── BookVisitScreen.tsx      # Slot scheduling + optional rating
│   │   │   ├── PropertyManagementScreen.tsx # Flow D flat upload & status
│   │   │   ├── HomeLoanScreen.tsx       # Flow E EMI calc, bank comparison & request
│   │   │   ├── RentalAgreementScreen.tsx# Flow F legal preview & payment order
│   │   │   ├── OwnerVerificationScreen.tsx  # Flow G & B verification & PDF download
│   │   │   └── AdminPortalScreen.tsx    # Section 2: 7 Review Queues & actions
│   │   └── services/
│   │       └── api.ts                   # Strongly-typed API client for NestJS
│   └── package.json
│
├── docs/                     # Architecture, Database, APIs, & Run Guides
└── package.json              # Unified root scripts (start:backend, start:frontend, test:backend)
```

---

## 3. Technology Stack
| Layer | Technology | Rationale |
|---|---|---|
| **Mobile & Web Frontend** | React Native, Expo, React 19, TypeScript | Single cross-platform codebase supporting iOS, Android, and Web with native performance |
| **Theme & Design** | Solid colors (`#009587` Jade Teal, `#004953` Deep Petrol, `#FD3752` Coral Red) | Professional real-estate aesthetic; no distracting gradients, watermarks, or AI branding |
| **Backend Framework** | NestJS (Express adapter), Node v24, TypeScript | Scalable, modular enterprise architecture with clean separation of concerns |
| **Database & ORM** | PostgreSQL 16+ with Prisma ORM | Relational integrity, foreign key constraints, ACID compliance, and migration safety |
| **Authentication** | JWT (7-day access, 30-day refresh) + Role-Based Access Control | Secure isolation between Customers, Owners, Field Agents, and Admin staff |
| **API Documentation** | Swagger / OpenAPI (`/api/docs`) | Interactive schema contracts for frontend and external integration |
| **Automated Testing** | Vitest & Supertest | End-to-end regression validation for all business workflows |
