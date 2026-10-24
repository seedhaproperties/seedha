import { UserRole, ListingTypeEnum, PropertyStatusEnum } from './constants.js';
export interface PropertyRecord {
    id: string;
    title: string;
    description: string;
    listingType: ListingTypeEnum;
    propertyType: string;
    status: PropertyStatusEnum;
    price: number;
    priceLabel: string;
    location: string;
    city: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    furnishing: string;
    parking: boolean;
    deposit?: number;
    maintenance?: number;
    facing?: string;
    floor?: string;
    totalFloors?: number;
    images: string[];
    amenities: string[];
    verified: boolean;
    featured?: boolean;
    ownerId?: string;
    ownerName: string;
    ownerPhone: string;
    rejectionReason?: string;
    fieldAgentName?: string;
    fieldNotes?: string;
    verifiedAt?: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SiteVisitRecord {
    id: string;
    propertyId: string;
    userId?: string;
    userName: string;
    userPhone: string;
    userEmail?: string;
    date: string;
    timeSlot: string;
    status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    rating?: number;
    ratingComment?: string;
    createdAt: string;
    updatedAt: string;
}
export interface PropertyManagementRecord {
    id: string;
    ownerId?: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail?: string;
    flatDetails: string;
    address: string;
    city: string;
    locality: string;
    serviceRequested: string;
    status: 'SUBMITTED' | 'ADMIN_REVIEW' | 'LOCATION_CHECK_PASSED' | 'LOCATION_CHECK_REJECTED' | 'ASSIGNED_TEAM' | 'OWNER_CONTACTED' | 'COMPLETED';
    locationMatched: boolean;
    rejectionMessage?: string;
    assignedTeamMember?: string;
    contactNotes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface HomeLoanRecord {
    id: string;
    userId?: string;
    userName: string;
    userPhone: string;
    userEmail?: string;
    loanType: string;
    propertyCost: number;
    loanAmount: number;
    tenureYears: number;
    monthlyIncome: number;
    existingEmi: number;
    calculatedEmi: number;
    selectedBank?: string;
    status: 'REQUESTED' | 'UNDER_REVIEW' | 'TEAM_CONTACTED' | 'DOCUMENTS_COLLECTED' | 'APPROVED' | 'REJECTED';
    assignedStaff?: string;
    contactNotes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface RentalAgreementRecord {
    id: string;
    userId?: string;
    landlordName: string;
    landlordPhone: string;
    landlordEmail?: string;
    landlordAddress: string;
    tenantName: string;
    tenantPhone: string;
    tenantEmail?: string;
    tenantAddress: string;
    propertyAddress: string;
    monthlyRent: number;
    securityDeposit: number;
    leaseTermMonths: number;
    agreementStartDate: string;
    status: 'DRAFT' | 'SUBMITTED' | 'PAYMENT_PENDING' | 'PAID' | 'DOCUMENT_PREPARED' | 'SENT_TO_USER' | 'COMPLETED' | 'REJECTED';
    paymentAmount: number;
    paymentTxnId?: string;
    documentUrl?: string;
    preparedByStaff?: string;
    createdAt: string;
    updatedAt: string;
}
export interface OwnerBackgroundRecord {
    id: string;
    userId?: string;
    flatNumber: string;
    buildingName: string;
    propertyAddress: string;
    city: string;
    ownerName: string;
    ownerPhone: string;
    status: 'SUBMITTED' | 'PAYMENT_PENDING' | 'PAID' | 'ADMIN_CHECKING' | 'FIELD_WORK_ASSIGNED' | 'DETAILS_COLLECTED' | 'REPORT_GENERATED' | 'SENT_DIGITALLY' | 'REJECTED';
    paymentAmount: number;
    paymentTxnId?: string;
    ownershipVerified: boolean;
    legalDisputeClear: boolean;
    taxReceiptsVerified: boolean;
    societyDuesClear: boolean;
    reportSummary?: string;
    reportPdfUrl?: string;
    digitalSentAt?: string;
    fieldAgentNotes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: UserRole;
    createdAt: string;
}
declare class InMemoryStore {
    users: UserRecord[];
    properties: PropertyRecord[];
    siteVisits: SiteVisitRecord[];
    propertyManagementRequests: PropertyManagementRecord[];
    homeLoanRequests: HomeLoanRecord[];
    rentalAgreementOrders: RentalAgreementRecord[];
    ownerBackgroundChecks: OwnerBackgroundRecord[];
}
export declare const mockDb: InMemoryStore;
export {};
