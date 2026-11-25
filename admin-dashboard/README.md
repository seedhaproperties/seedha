# Seedha Properties — Admin Operations Web Dashboard

A separate, dedicated, production-ready Admin Web Dashboard for **Seedha Properties** real estate platform. Designed for internal operations managers, verification executives, field agents, loan advisors, and legal specialists to triage submissions, execute field visits, verify documents, and publish live listings.

---

## 🏗 System Architecture

```text
seedha-properties/
├── frontend/                 # Existing React Native + Expo User Mobile App
├── admin-dashboard/          # New React 18 + Vite + TypeScript Admin Dashboard
├── backend/                  # Shared NestJS Backend (Port 4000) & PostgreSQL DB
└── README.md
```

- **User Mobile App** and **Admin Dashboard** operate independently on the frontend while connecting to the **same NestJS backend (`http://localhost:4000/api/v1`)** and shared PostgreSQL database.
- **Independently Deployable**: Can be deployed directly to Vercel or any modern static web host.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- npm or pnpm
- Shared backend running on port 4000 (`npm run start:dev` inside `backend/`)

### 2. Installation
```bash
cd admin-dashboard
npm install
```

### 3. Environment Configuration
Create or edit `.env`:
```env
VITE_API_URL=http://localhost:4000/api/v1
```

### 4. Start Development Server
```bash
npm run dev
```
The dashboard will be available at: **`http://localhost:5173`**

### 5. Production Build
```bash
npm run build
```
Generates optimized, production-ready static assets in `admin-dashboard/dist/`.

---

## 🌐 Vercel Deployment Instructions

To deploy the Admin Dashboard independently on Vercel:

1. Import the `seedhaproperties` repository in Vercel.
2. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `admin-dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. In **Environment Variables**:
   - `VITE_API_URL`: Your deployed NestJS backend URL (e.g. `https://api.seedhaproperties.com/api/v1`)
4. Deploy! Single Page Application (SPA) client-side routes are pre-configured via `vercel.json`.

---

## 🔑 Authentication & Demo Access

- **Route**: `/login`
- **Default Super Admin**:
  - Email: `admin@seedhaproperties.com`
  - Password: `Admin@123`
- **Instant Demo**: Click **"Fill Admin Demo"** on the login page to pre-populate credentials and log in instantly.
- JWT token is securely stored and forwarded via the `Authorization: Bearer <token>` header on all requests.

---

## 🏢 7 Business Vertical Modules

| # | Module | Subtitle | Operational Workflow |
|---|---|---|---|
| **1** | **Flat / Building** | Resale & new apartment units | `Check → Contact / Field Visit → Field Verification → Publish` |
| **2** | **Rent** | Residential rental units | `Check → Contact / Field Visit → Field Verification → Publish` |
| **3** | **Commercial** | Offices, retail shops & warehouses | `Check → Contact / Field Visit → Field Verification → Publish` |
| **4** | **Property Management** | End-to-end owner onboarding | `Check → Location Check → Radius Match/Mismatch → Contact Owner` |
| **5** | **Home Loan** | Borrower mortgage advisory | `New Lead → Contacted → Docs Collected → Bank Submitted → Approved` |
| **6** | **Rental Agreements** | Digital stamp duty & signing | `Draft → Legal Review → E-Sign Dispatch → Delivered` |
| **7** | **Owner Verification** | Background, title & court checks | `Digital Verification → Physical Inspection → Clear / Flagged Report` |

---

## 📋 Features & Functionalities

1. **Operations Dashboard (`/`)**:
   - Live KPI overview cards (Total Submissions, New, Under Review, Live Published, Urgent SLA alerts).
   - 7 Interactive Vertical pipeline cards with count badges and direct filters.
   - Priority SLA queue with real-time countdown badges and quick triage links.

2. **Requests & Inbox (`/requests`)**:
   - 8 Module tabs (All + 7 verticals).
   - Status filters (`All`, `New`, `In Review`, `Assigned`, `Field Visit`, `Verified`, `Published`, `Needs Info`, `Rejected`).
   - Fast full-text search across titles, codes, localities, owner names, and phone numbers.
   - 1-click row action shortcuts (Quick Contact, Assign Staff, Reject).

3. **Two-Column Request Detail & Decision Engine (`/requests/:id`)**:
   - **Left Column**: Module-specific workflow action controls, photo gallery with thumbnail switcher, comprehensive property specifications, uploaded document inspector with digital watermarking preview, and time-stamped operational audit trail.
   - **Right Column**: Owner profile with direct Call & WhatsApp buttons, assigned staff card with re-assignment, and quick decision action buttons.

4. **Interactive Action Modals**:
   - **Assign Staff Modal**: Select agents from active roster, assign operational zones, and provide custom field instructions.
   - **Field Visit Checklist Modal**: Verify physical building existence, owner identity with Govt ID, geo-tagged photo verification, and notes.
   - **Service Radius Check Modal (Module 4)**: Calculates distance from nearest operations hub (e.g. Hyderabad Financial District) against allowed radius limit (15 km); automatically triggers rejection if outside radius or approves for contact if matched.
   - **Verify & Publish Modal**: One-click approval applying the "Verified Seedha Guarantee" badge and publishing to the live user mobile app search.
   - **Reject Modal**: Pre-configured rejection reason templates with customizable message sent directly to the owner.
   - **Request Info Modal**: Select missing documents (EC, tax challan, layout plan) with custom note sent to user.
   - **Document Viewer Modal**: Preview submitted scans, PDFs, and legal certificates.

5. **Live Listings Manager (`/listings`)**:
   - Overview of all published listings searchable in the user mobile app.
   - Ability to unpublish or view live details.

6. **Team & Staff Directory (`/team`)**:
   - Roster of field agents, loan advisors, and legal specialists.
   - Active task load tracking and quick phone dialer.
   - Add new staff member modal.

7. **Alerts & SLA Notifications (`/notifications`)**:
   - SLA deadline warnings and urgent field notifications with "Mark as Read".

8. **Reports & Analytics (`/reports`)**:
   - Vertical throughput breakdown, average turnaround hours (SLA compliance), and approval/rejection ratios.

9. **Settings & Service Zones (`/settings`)**:
   - Active operational hubs, service radius thresholds, and rejection notice templates.
