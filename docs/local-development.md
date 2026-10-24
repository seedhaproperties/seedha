# Seedha Properties — Local Development & Run Guide

## Prerequisites
- Node.js v20+ or v24+
- npm v10+

---

## 1. Quick Start Commands

From the project root (`e:\seedha properties\`):

### Run Both Simultaneously (or in separate terminals):
```powershell
# Terminal 1: Start NestJS Backend API (Port 4000)
npm run start:backend

# Terminal 2: Start Expo / React Native Web Frontend
npm run start:frontend
```

---

## 2. API Endpoints & Swagger Documentation
- **API Base URL**: `http://localhost:4000/api/v1`
- **Swagger Interactive API Docs**: `http://localhost:4000/api/docs`

---

## 3. Running Automated Tests
```powershell
# Run the complete E2E workflow test suite (Section 1 + Section 2)
npm run test:backend
```

---

## 4. Frontend Screen Workflow Quick Navigation
- **Home Screen**: Features all 7 core service entry points (Buy, Rent, Commercial, Property Management, Home Loans, Rental Agreements, Owner Verification) plus the **Admin Operations** portal.
- **Buy / Rent / Commercial Flows**: Home → Select category → Filter listings → Open property → View Owner Details → Book Visit → Optional Rating.
- **Rent Homes Decision Branch**: Rent property details → "Verify Owner Background (₹499)" or "Skip & Book Visit" → Payment → Digital Report → PDF Download → Book Visit.
- **Property Management**: Home → Property Management → Enter flat details → Submit to Admin.
- **Home Loans**: Home → Home Loans → Select type → EMI & Eligibility Calculator → Compare Bank Loans → Request Assistance.
- **Rental Agreements**: Home → Rental Agreements → Enter landlord/tenant info → Legal Preview → Pay ₹999 → Order placed.
- **Admin Operations Desk**: Accessible via Home "Admin Operations" tile or Profile menu:
  - Tab 1: Flat/Building Listings Review (Assign field work / Verify & publish / Reject)
  - Tab 2: Rent Listings Review (Verify & publish)
  - Tab 3: Commercial Listings Review (Verify & publish)
  - Tab 4: Property Management (Check location match vs reject / Contact owner)
  - Tab 5: Home Loans (Direct contact to customer)
  - Tab 6: Rental Agreements (Prepare documents & send to user)
  - Tab 7: Owner Background Details (Field work / Collect details & digital send)
