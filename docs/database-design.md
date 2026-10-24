# Seedha Properties — Database Design & Schema Specification

## 1. Relational Database Overview
The Seedha Properties PostgreSQL database is designed with normalized entities supporting high concurrency, transactional integrity, and strong foreign key constraints.

---

## 2. Entity Relational Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ PROPERTY : "owns"
    USER ||--o{ SITE_VISIT : "books"
    USER ||--o{ PROPERTY_MANAGEMENT_REQUEST : "submits"
    USER ||--o{ HOME_LOAN_REQUEST : "requests"
    USER ||--o{ RENTAL_AGREEMENT_ORDER : "orders"
    USER ||--o{ OWNER_BACKGROUND_CHECK : "orders"
    USER ||--o{ REFRESH_TOKEN : "has"
    PROPERTY ||--o{ SITE_VISIT : "hosts"

    USER {
        string id PK
        string email UK
        string phone UK
        string name
        string passwordHash
        Role role
        datetime createdAt
    }

    PROPERTY {
        string id PK
        string title
        string description
        ListingType listingType
        string propertyType
        PropertyStatus status
        float price
        string location
        string city
        int bedrooms
        int bathrooms
        boolean verified
        string ownerName
        string ownerPhone
    }

    SITE_VISIT {
        string id PK
        string propertyId FK
        string userId FK
        string date
        string timeSlot
        string status
        int rating
        string ratingComment
    }

    PROPERTY_MANAGEMENT_REQUEST {
        string id PK
        string ownerId FK
        string flatDetails
        string address
        string locality
        string city
        string serviceRequested
        string status
        boolean locationMatched
    }

    HOME_LOAN_REQUEST {
        string id PK
        string userId FK
        string loanType
        float propertyCost
        float loanAmount
        int tenureYears
        float monthlyIncome
        float calculatedEmi
        string status
    }

    RENTAL_AGREEMENT_ORDER {
        string id PK
        string userId FK
        string landlordName
        string tenantName
        string propertyAddress
        float monthlyRent
        float securityDeposit
        string status
        float paymentAmount
        string paymentTxnId
        string documentUrl
    }

    OWNER_BACKGROUND_CHECK {
        string id PK
        string userId FK
        string flatNumber
        string buildingName
        string ownerName
        string ownerPhone
        string status
        float paymentAmount
        boolean ownershipVerified
        boolean legalDisputeClear
        string reportPdfUrl
    }
```

---

## 3. Financial Integrity & Decimal Safety
- Monetary columns (`price`, `monthlyRent`, `securityDeposit`, `paymentAmount`, `loanAmount`, `calculatedEmi`) are isolated from client-side manipulation.
- All payments must pass verified server-side callbacks with idempotency tokens before records change to `PAID` or documents are unlocked.
- Duplicate site visits are strictly prevented via composite uniqueness: `(propertyId, userPhone, date, timeSlot)`.
