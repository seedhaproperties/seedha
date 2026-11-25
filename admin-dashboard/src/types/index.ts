export type ModuleType =
  | 'flat_building'
  | 'buy_sell'
  | 'rent'
  | 'commercial'
  | 'pg_hostel'
  | 'property_management'
  | 'home_loan'
  | 'rental_agreements'
  | 'owner_background';

export type GlobalStatus =
  | 'new'
  | 'in_review'
  | 'assigned'
  | 'field_visit'
  | 'verified'
  | 'published'
  | 'rejected'
  | 'needs_info';

export type RequestStatus = GlobalStatus;

export type PostPublishState =
  | 'live'
  | 'unpublished'
  | 'archived'
  | 'rented'
  | 'sold';

export type HomeLoanStage =
  | 'new_lead'
  | 'contacted'
  | 'docs_collected'
  | 'bank_submitted'
  | 'approved'
  | 'rejected';

export type AgreementStage =
  | 'draft'
  | 'review'
  | 'esign_pending'
  | 'delivered';

export type BackgroundResult = 'pending' | 'clear' | 'flagged';

export type LocationMatchStatus = 'pending' | 'matched' | 'mismatched';

export interface TeamMember {
  id: string;
  name: string;
  role: 'Field Agent' | 'Verification Exec' | 'Loan Advisor' | 'Legal Ops';
  phone: string;
  zone: string;
  activeTasks: number;
  completedThisWeek: number;
  avgTurnaroundHrs: number;
  initials: string;
  avatar?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  verified: boolean;
  uploadedAt: string;
  summary: string;
  url?: string;
  title?: string;
  fileType?: string;
  fileSize?: string;
  fileUrl?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  detail?: string;
  timestamp: string;
  performedBy?: string;
  details?: string;
}

export type AuditLogEntry = AuditEvent;

export interface FieldVisitPhoto {
  id: string;
  label: string;
  captured: boolean;
  kind: 'exterior' | 'living' | 'kitchen' | 'docs';
  url?: string;
}

export interface FieldVisitData {
  gpsCheckedIn: boolean;
  gpsCoords?: string;
  gpsTimestamp?: string;
  photos: FieldVisitPhoto[];
  ownerConfirmed: boolean;
  notes: string;
  submittedAt?: string;
  scheduledAt?: string;
  status?: string;
  agentName?: string;
  agentPhone?: string;
  checklist?: Array<{ item: string; completed: boolean }>;
}

export interface PropertyRequest {
  id: string;
  code: string;
  module: ModuleType;
  title: string;
  subtitle: string;
  locality: string;
  city: string;
  address: string;
  priceDisplay: string;
  priceNumeric: number;
  areaSqFt: number;
  configLabel: string;
  furnishing?: string;
  availability?: string;
  status: GlobalStatus;
  postPublishState?: PostPublishState;
  slaMinutesLeft: number;
  slaDeadlineMinutes?: number;
  slaUrgent?: boolean;
  submittedAt: string;
  relativeTime: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedTo?: TeamMember;
  ownerOrUser: {
    name: string;
    role: 'Owner' | 'Applicant' | 'Tenant' | 'Buyer';
    phone: string;
    email: string;
    whatsapp: string;
  };
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerContacted?: boolean;
  visualVariant: 'apartment' | 'villa' | 'commercial' | 'management' | 'loan' | 'agreement' | 'background';
  images: string[];
  photos?: string[];
  documents: DocumentItem[];
  auditLog: AuditEvent[];
  rejectionReason?: string;
  rejectionMessage?: string;
  moreInfoNote?: string;
  description?: string;
  specs?: any;
  updatedAt?: string;

  // Field visit
  fieldVisit: FieldVisitData;

  // Module 4: Property Management
  locationCheck?: {
    status: LocationMatchStatus;
    inServiceRadius: boolean;
    distanceKm: number;
    nearestHub: string;
    latLng: string;
    checkedAt?: string;
    checkedBy?: string;
  };

  // Module 5: Home Loan
  homeLoan?: {
    stage: HomeLoanStage;
    partnerBank: string;
    loanAmount: string;
    tenureYears: number;
    cibilScore: number;
    employmentType: string;
    monthlyIncome: string;
    applicationStage?: string;
  };

  // Module 6: Rental Agreements
  rentalAgreement?: {
    stage: AgreementStage;
    monthlyRent: string;
    securityDeposit: string;
    lockInMonths: number;
    durationMonths: number;
    tenantName: string;
    landlordName: string;
    eSignMethod: string;
    status?: string;
    stampPaperValue?: number;
  };

  // Module 7: Owner Background (Flat & Owner)
  ownerBackground?: {
    result: BackgroundResult;
    privacyConsent: boolean;
    consentTimestamp: string;
    checks: {
      id: string;
      label: string;
      status: 'passed' | 'flagged' | 'pending';
      note: string;
    }[];
    reportDeliveredAt?: string;
    identityVerified?: boolean;
    ownershipVerified?: boolean;
    courtCasesFound?: boolean;
    overallStatus?: string;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time?: string;
  group?: 'Today' | 'Yesterday';
  unread?: boolean;
  read?: boolean;
  isSlaAlert?: boolean;
  requestId?: string;
  type?: 'urgent' | 'info' | 'success' | 'warning' | 'SLA_BREACH' | 'URGENT';
  message?: string;
  timestamp?: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  zone: string;
  active: boolean;
  hubName?: string;
  serviceRadiusKm?: number;
}

export interface RejectionTemplate {
  id: string;
  title: string;
  module: ModuleType | 'all';
  body: string;
  label?: string;
  template?: string;
}
