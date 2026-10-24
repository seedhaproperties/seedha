# Seedha Properties — API Contracts Specification

Base URL: `http://localhost:4000/api/v1`  
Swagger Documentation: `http://localhost:4000/api/docs`

---

## 1. Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register customer, owner, or staff | Public |
| `POST` | `/api/v1/auth/login` | Login with email/phone & password | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Bearer JWT |

---

## 2. Properties (Buy, Rent, Commercial)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/properties` | Search & filter listings (type, city, locality, budget, bhk) | Public |
| `GET` | `/api/v1/properties/:id` | View full property specifications & amenities | Public |
| `GET` | `/api/v1/properties/:id/owner`| Fetch authorized owner contact info | Public |
| `POST` | `/api/v1/properties` | Owner submits flat/building details for admin review | Bearer JWT |

---

## 3. Site Visits & Optional Rating
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/properties/:id/visits` | Book visit slot (duplicate check enforced) | Public / User |
| `POST` | `/api/v1/site-visits/:id/rating`| Submit optional 1-5 star rating & feedback | Public / User |
| `GET` | `/api/v1/site-visits/my` | View user scheduled property visits | Bearer JWT |

---

## 4. Property Management (Flow D)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/property-management/requests` | Owner uploads flat details; directs to Admin | Public / Owner |
| `GET` | `/api/v1/property-management/my` | View submitted management requests | Bearer JWT |

---

## 5. Home Loans (Flow E)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/home-loans/types` | List configured loan categories | Public |
| `POST` | `/api/v1/home-loans/calculate` | Compute exact EMI & indicative eligibility | Public |
| `GET` | `/api/v1/home-loans/compare-banks`| Compare bank rates & processing fees | Public |
| `GET` | `/api/v1/home-loans/documents/:type`| Checklist of required documents | Public |
| `POST` | `/api/v1/home-loans/assistance` | Submit request for Seedha loan desk contact | Public / User |

---

## 6. Rental Agreements (Flow F)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/rental-agreements/preview` | Preview formatted legal agreement draft | Public / User |
| `POST` | `/api/v1/rental-agreements/order` | Pay ₹999 fee and place agreement order | Public / User |
| `GET` | `/api/v1/rental-agreements/:id` | Download executed document & track status | Public / User |

---

## 7. Owner Background Verification (Flow G & Flow B)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/owner-background` | Submit flat & owner details for check | Public / User |
| `POST` | `/api/v1/owner-background/:id/pay`| Pay ₹499 fee and trigger digital delivery | Public / User |
| `GET` | `/api/v1/owner-background/:id/report` | Fetch verified audit checklist & summary | Public / User |
| `GET` | `/api/v1/owner-background/:id/report-pdf` | Download signed verification PDF report | Public / User |

---

## 8. Admin Operations & Review Queues (Section 2)
| Method | Endpoint | Description | Queue |
|---|---|---|---|
| `GET` | `/api/v1/admin/overview` | Summary counts of all 7 pending review queues | All |
| `GET` | `/api/v1/admin/flats-review` | Queue 1: Flat/Building submissions | Queue 1 |
| `GET` | `/api/v1/admin/rent-review` | Queue 2: Rent listing submissions | Queue 2 |
| `GET` | `/api/v1/admin/commercial-review` | Queue 3: Commercial space submissions | Queue 3 |
| `POST` | `/api/v1/admin/properties/:id/assign-field-work` | Dispatch team member for owner contact/field work | Queues 1-3 |
| `POST` | `/api/v1/admin/properties/:id/verify-and-publish` | Verify and publish listing live | Queues 1-3 |
| `POST` | `/api/v1/admin/properties/:id/reject` | Reject listing with notification reason | Queues 1-3 |
| `GET` | `/api/v1/admin/property-management-review` | Queue 4: Property Management submissions | Queue 4 |
| `POST` | `/api/v1/admin/property-management/:id/check-location` | Location serviceability check (Match vs Reject) | Queue 4 |
| `POST` | `/api/v1/admin/property-management/:id/contact-owner` | Team contacts owner to onboard flat | Queue 4 |
| `GET` | `/api/v1/admin/home-loans-review` | Queue 5: Home Loan assistance requests | Queue 5 |
| `POST` | `/api/v1/admin/home-loans/:id/contact-user` | Direct staff call to applicant for documents | Queue 5 |
| `GET` | `/api/v1/admin/rental-agreements-review` | Queue 6: Rental Agreement orders | Queue 6 |
| `POST` | `/api/v1/admin/rental-agreements/:id/prepare-and-send` | Prepare e-stamp documents & send to user | Queue 6 |
| `GET` | `/api/v1/admin/owner-background-review` | Queue 7: Owner background checks | Queue 7 |
| `POST` | `/api/v1/admin/owner-background/:id/field-work` | Team field work & records verification | Queue 7 |
| `POST` | `/api/v1/admin/owner-background/:id/collect-and-send-digital` | Collect details & send report digitally | Queue 7 |
