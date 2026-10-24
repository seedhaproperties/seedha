// API Client for Seedha Properties Backend (NestJS @ http://localhost:4000/api/v1)
import { Platform } from 'react-native';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.warn(`[API] fetch to ${url} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // ── Authentication ──
  auth: {
    login: (identifier: string, password: string) =>
      request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }),
    register: (payload: any) =>
      request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // ── Properties (Buy, Rent, Commercial) ──
  properties: {
    list: (params?: { type?: string; location?: string; city?: string; minPrice?: number; maxPrice?: number; bhk?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.append('type', params.type.toUpperCase());
      if (params?.location) searchParams.append('location', params.location);
      if (params?.city) searchParams.append('city', params.city);
      if (params?.bhk) searchParams.append('bhk', String(params.bhk));
      if (params?.minPrice) searchParams.append('minPrice', String(params.minPrice));
      if (params?.maxPrice) searchParams.append('maxPrice', String(params.maxPrice));
      const q = searchParams.toString();
      return request<any>(`/properties${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<any>(`/properties/${id}`),
    getOwner: (id: string) => request<any>(`/properties/${id}/owner`),
    create: (data: any) =>
      request<any>('/properties', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── Site Visits & Rating ──
  visits: {
    book: (propertyId: string, payload: { date: string; timeSlot: string; userName: string; userPhone: string; notes?: string }) =>
      request<any>(`/properties/${propertyId}/visits`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    submitRating: (visitId: string, rating: number, comment?: string) =>
      request<any>(`/site-visits/${visitId}/rating`, {
        method: 'POST',
        body: JSON.stringify({ rating, ratingComment: comment }),
      }),
  },

  // ── Property Management (Flow D) ──
  propertyManagement: {
    submit: (payload: { ownerName: string; ownerPhone: string; flatDetails: string; address: string; city: string; locality: string; serviceRequested: string }) =>
      request<any>('/property-management/requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // ── Home Loans (Flow E) ──
  homeLoans: {
    getTypes: () => request<any[]>('/home-loans/types'),
    calculate: (payload: { loanAmount: number; interestRate: number; tenureYears: number; monthlyIncome?: number; existingEmi?: number }) =>
      request<any>('/home-loans/calculate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    compareBanks: () => request<any[]>('/home-loans/compare-banks'),
    getDocuments: (loanType: string) => request<any>(`/home-loans/documents/${loanType}`),
    requestAssistance: (payload: any) =>
      request<any>('/home-loans/assistance', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // ── Rental Agreements (Flow F) ──
  rentalAgreements: {
    preview: (details: any) =>
      request<any>('/rental-agreements/preview', {
        method: 'POST',
        body: JSON.stringify(details),
      }),
    order: (details: any, payment: { paymentTxnId: string; paymentAmount: number }) =>
      request<any>('/rental-agreements/order', {
        method: 'POST',
        body: JSON.stringify({ details, payment }),
      }),
    get: (id: string) => request<any>(`/rental-agreements/${id}`),
  },

  // ── Owner Background Verification (Flow G & Flow B) ──
  ownerBackground: {
    create: (payload: { flatNumber: string; buildingName: string; propertyAddress: string; city: string; ownerName: string; ownerPhone: string }) =>
      request<any>('/owner-background', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    pay: (id: string, paymentTxnId: string, paymentAmount: number = 499) =>
      request<any>(`/owner-background/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentTxnId, paymentAmount }),
      }),
    getReport: (id: string) => request<any>(`/owner-background/${id}/report`),
  },

  // ── Admin Operations & Review Queues (Section 2) ──
  admin: {
    getOverview: () => request<any>('/admin/overview'),
    getFlatsQueue: () => request<any[]>('/admin/flats-review'),
    getRentQueue: () => request<any[]>('/admin/rent-review'),
    getCommercialQueue: () => request<any[]>('/admin/commercial-review'),
    assignPropertyFieldWork: (id: string, fieldAgentName: string, fieldNotes?: string) =>
      request<any>(`/admin/properties/${id}/assign-field-work`, {
        method: 'POST',
        body: JSON.stringify({ fieldAgentName, fieldNotes }),
      }),
    verifyAndPublishProperty: (id: string) =>
      request<any>(`/admin/properties/${id}/verify-and-publish`, { method: 'POST' }),
    rejectProperty: (id: string, reason: string) =>
      request<any>(`/admin/properties/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    // Property Management
    getPropertyManagementQueue: () => request<any[]>('/admin/property-management-review'),
    checkLocation: (id: string, matchesLocation: boolean, rejectMessage?: string) =>
      request<any>(`/admin/property-management/${id}/check-location`, {
        method: 'POST',
        body: JSON.stringify({ matchesLocation, rejectMessage }),
      }),
    contactOwner: (id: string, notes: string, assignedStaff?: string) =>
      request<any>(`/admin/property-management/${id}/contact-owner`, {
        method: 'POST',
        body: JSON.stringify({ notes, assignedStaff }),
      }),
    // Home Loans
    getHomeLoansQueue: () => request<any[]>('/admin/home-loans-review'),
    contactLoanUser: (id: string, notes: string, assignedStaff?: string) =>
      request<any>(`/admin/home-loans/${id}/contact-user`, {
        method: 'POST',
        body: JSON.stringify({ notes, assignedStaff }),
      }),
    // Rental Agreements
    getRentalAgreementsQueue: () => request<any[]>('/admin/rental-agreements-review'),
    prepareAndSendAgreement: (id: string, preparationNotes: string, documentUrl?: string) =>
      request<any>(`/admin/rental-agreements/${id}/prepare-and-send`, {
        method: 'POST',
        body: JSON.stringify({ preparationNotes, documentUrl }),
      }),
    // Owner Background
    getOwnerBackgroundQueue: () => request<any[]>('/admin/owner-background-review'),
    assignOwnerBgFieldWork: (id: string, fieldAgentName: string, fieldNotes?: string) =>
      request<any>(`/admin/owner-background/${id}/field-work`, {
        method: 'POST',
        body: JSON.stringify({ fieldAgentName, fieldNotes }),
      }),
    collectAndSendDigitalOwner: (id: string, summary: string, ownershipVerified = true, legalDisputeClear = true) =>
      request<any>(`/admin/owner-background/${id}/collect-and-send-digital`, {
        method: 'POST',
        body: JSON.stringify({ summary, ownershipVerified, legalDisputeClear }),
      }),
  },
};
