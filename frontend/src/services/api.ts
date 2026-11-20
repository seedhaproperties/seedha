import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getHost = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  const debuggerHost = hostUri?.split(':')[0];
  // If running via Expo Tunnel (.exp.direct), the tunnel only forwards Metro (port 8081), not port 4000.
  // We fall back to the LAN IP of the host machine so phones on Wi-Fi can reach the API.
  if (debuggerHost && !debuggerHost.includes('exp.direct')) {
    return debuggerHost;
  }
  return '192.168.29.234';
};

export const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim() !== '') {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal && window.location.port !== '4000') {
      return `http://${window.location.hostname}:4000/api/v1`;
    }
    return `${window.location.origin}/api/v1`;
  }
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri && hostUri.includes('exp.direct')) {
    return `https://${hostUri}/api/v1`;
  }
  const host = getHost();
  return `http://${host}:4000/api/v1`;
};

let currentAuthToken: string | null = null;

if (typeof window !== 'undefined' && window.localStorage) {
  try {
    currentAuthToken = window.localStorage.getItem('seedha_auth_token');
  } catch {}
}

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (token) {
        window.localStorage.setItem('seedha_auth_token', token);
      } else {
        window.localStorage.removeItem('seedha_auth_token');
      }
    } catch {}
  }
}

export function getAuthToken(): string | null {
  return currentAuthToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    ...(currentAuthToken ? { Authorization: `Bearer ${currentAuthToken}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    const text = await res.text();
    let data: any = {};
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network and make sure the server is reachable.');
    }
    // Suppress console spam for expected 401 checks (e.g. /auth/me for unauthenticated visitors)
    if (path !== '/auth/me') {
      console.warn(`[API] fetch to ${url} failed:`, err.message);
    }
    throw err;
  }
}

export const api = {
  // ── Authentication ──
  auth: {
    login: async (identifier: string, password: string) => {
      const data = await request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },
    register: async (payload: any) => {
      const data = await request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },
    sendOtp: (identifier: string) =>
      request<any>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      }),
    resendOtp: (identifier: string) =>
      request<any>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      }),
    verifyOtp: async (identifier: string, otp: string, name?: string) => {
      const data = await request<any>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp, ...(name ? { name } : {}) }),
      });
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },
    completeSignup: async (payload: { name: string; phone?: string; email?: string }) => {
      const data = await request<any>('/auth/complete-signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },
    googleLogin: async (payload: {
      code?: string;
      codeVerifier?: string;
      redirectUri?: string;
      idToken?: string;
      accessToken?: string;
      email?: string;
      name?: string;
      googleId?: string;
      phone?: string;
    }) => {
      const data = await request<any>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },
    appleLogin: async (payload: { email: string; name: string; appleId?: string; phone?: string }) => {
      const data = await request<any>('/auth/apple', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },
    refreshToken: async (refreshToken: string) => {
      const data = await request<any>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },
    forgotPassword: (email: string) =>
      request<any>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    me: () => request<any>('/auth/me'),
    logout: () => {
      setAuthToken(null);
    },
    setToken: setAuthToken,
    getToken: getAuthToken,
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
