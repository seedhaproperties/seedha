import axios, { AxiosInstance } from 'axios';
import {
  PropertyRequest,
  TeamMember,
  AppNotification,
  ServiceArea,
  AuditLogEntry,
  RequestStatus,
  ModuleType,
  RejectionTemplate,
} from '../types';
import {
  INITIAL_SERVICE_AREAS,
  INITIAL_REJECTION_TEMPLATES,
} from '../data/mockData';

const getAdminApiBaseUrl = () => {
  if ((import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const isLocal =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal && window.location.port !== '4000') {
      return `http://${window.location.hostname}:4000/api/v1`;
    }
    return `${window.location.origin}/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
};

const API_BASE_URL = getAdminApiBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('seedha_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('seedha_admin_token');
        localStorage.removeItem('seedha_admin_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Clear legacy/mock keys from previous sessions
try {
  localStorage.removeItem('seedha_admin_requests_v2');
  localStorage.removeItem('seedha_admin_requests');
  localStorage.removeItem('seedha_admin_team_v2');
  localStorage.removeItem('seedha_admin_notifications_v2');
} catch {
  // ignore
}

// In-memory cache of real database records
let _cachedRequests: PropertyRequest[] = [];
let _cachedTeam: TeamMember[] = [];
let _cachedNotifications: AppNotification[] = [];

// Normalize request object for complete UI safety
export function normalizeRequest(req: PropertyRequest): PropertyRequest {
  return {
    ...req,
    ownerName: req.ownerName || req.ownerOrUser?.name || 'Property Owner',
    ownerPhone: req.ownerPhone || req.ownerOrUser?.phone || '',
    ownerEmail: req.ownerEmail || req.ownerOrUser?.email || '',
    slaDeadlineMinutes:
      req.slaDeadlineMinutes !== undefined ? req.slaDeadlineMinutes : req.slaMinutesLeft,
    photos: req.photos?.length ? req.photos : req.images?.length ? req.images : [],
    images: req.images?.length ? req.images : req.photos?.length ? req.photos : [],
    auditLog: req.auditLog || [],
    documents: req.documents || [],
  };
}

export const adminService = {
  // Fetch summary metrics from NestJS backend
  async getMetrics() {
    try {
      const res = await apiClient.get('/admin/overview');
      const data = res.data?.data || res.data;
      return {
        totalRequests: data.totalRequests ?? 0,
        newRequests: data.newRequests ?? 0,
        inReview: data.inReview ?? 0,
        verified: data.verified ?? 0,
        published: data.published ?? 0,
        rejected: data.rejected ?? 0,
        slaAlerts: data.slaAlerts ?? 0,
        moduleCounts: data.moduleCounts ?? {},
        totalUsers: data.totalUsers ?? 0,
        totalProperties: data.totalProperties ?? 0,
        totalPublishedProperties: data.totalPublishedProperties ?? 0,
        totalVerifiedProperties: data.totalVerifiedProperties ?? 0,
        pendingFlatListings: data.pendingFlatListings ?? 0,
        pendingRentListings: data.pendingRentListings ?? 0,
        pendingCommercialListings: data.pendingCommercialListings ?? 0,
        pendingPgListings: data.pendingPgListings ?? 0,
        pendingPropertyManagement: data.pendingPropertyManagement ?? 0,
        pendingHomeLoans: data.pendingHomeLoans ?? 0,
        pendingRentalAgreements: data.pendingRentalAgreements ?? 0,
        pendingOwnerBackground: data.pendingOwnerBackground ?? 0,
      };
    } catch (e) {
      console.warn('[adminService] Backend /admin/overview call failed:', e);
      return {
        totalRequests: _cachedRequests.length,
        newRequests: _cachedRequests.filter((r) => r.status === 'new').length,
        inReview: _cachedRequests.filter(
          (r) => r.status === 'in_review' || r.status === 'assigned' || r.status === 'field_visit'
        ).length,
        verified: _cachedRequests.filter((r) => r.status === 'verified').length,
        published: _cachedRequests.filter((r) => r.status === 'published').length,
        rejected: _cachedRequests.filter((r) => r.status === 'rejected').length,
        slaAlerts: _cachedRequests.filter(
          (r) => (r.slaDeadlineMinutes ?? r.slaMinutesLeft ?? 100) <= 60 && r.status !== 'published' && r.status !== 'rejected'
        ).length,
        moduleCounts: {},
      };
    }
  },

  // Synchronous cache reader for components requiring synchronous initial render
  getRequestsSync(): PropertyRequest[] {
    return _cachedRequests.map(normalizeRequest);
  },

  // Get all property / service requests from actual database
  async getRequests(filters?: {
    module?: ModuleType | 'all';
    status?: RequestStatus | 'all';
    search?: string;
  }): Promise<PropertyRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.module && filters.module !== 'all') params.append('module', filters.module);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());

      const res = await apiClient.get(`/admin/requests?${params.toString()}`);
      const rawData = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(rawData)) {
        const normalized = rawData.map(normalizeRequest);
        // Only update full cache when fetching without filters
        if (!filters || (filters.module === 'all' && filters.status === 'all' && !filters.search)) {
          _cachedRequests = normalized;
        }
        return normalized;
      }
      return [];
    } catch (e) {
      console.error('[adminService] Backend /admin/requests call failed:', e);
      return [];
    }
  },

  // Get single request by ID directly from backend
  async getRequestById(id: string): Promise<PropertyRequest | null> {
    try {
      const res = await apiClient.get(`/admin/requests/${id}`);
      const data = res.data?.data || res.data;
      if (data && data.id) {
        return normalizeRequest(data);
      }
      return null;
    } catch (e) {
      console.warn(`[adminService] Backend /admin/requests/${id} call failed:`, e);
      return _cachedRequests.find((r) => r.id === id) || null;
    }
  },

  // Update request state via backend endpoints
  async updateRequest(
    id: string,
    updater: Partial<PropertyRequest>,
    auditNote?: string,
    performedBy: string = 'Admin Ops'
  ): Promise<PropertyRequest> {
    try {
      if (updater.status === 'published' || (updater.status as any) === 'approved') {
        await apiClient.post(`/admin/properties/${id}/approve`, {
          note: auditNote,
        });
      } else if (updater.status === 'rejected') {
        await apiClient.post(`/admin/properties/${id}/reject`, {
          reason: updater.rejectionReason || auditNote || 'Property rejected by verification team',
        });
      } else if (updater.status === 'in_review' && updater.postPublishState === 'unpublished') {
        await apiClient.post(`/admin/properties/${id}/unpublish`, {
          note: auditNote,
        });
      } else if (updater.status === 'assigned' || updater.assignedToId) {
        await apiClient.post(`/admin/properties/${id}/assign-field-work`, {
          fieldAgentName: updater.assignedTo?.name || updater.assignedToName || 'Field Agent',
          fieldNotes: auditNote || 'Field verification work assigned',
        });
      }
    } catch (err) {
      console.error('[adminService] Backend action call failed:', err);
    }

    // Refresh request from backend
    const fresh = await this.getRequestById(id);
    if (fresh) {
      const idx = _cachedRequests.findIndex((r) => r.id === id);
      if (idx !== -1) _cachedRequests[idx] = fresh;
      return fresh;
    }

    return normalizeRequest({
      id,
      title: 'Property Listing',
      ...updater,
    } as any);
  },

  // Assign Team Member
  async assignTeamMember(
    requestId: string,
    memberId: string,
    fieldInstructions?: string
  ): Promise<PropertyRequest> {
    const team = await this.getTeamMembers();
    const member = team.find((t) => t.id === memberId);

    return this.updateRequest(
      requestId,
      {
        assignedToId: member?.id || memberId,
        assignedTo: member,
        assignedToName: member?.name,
        status: 'assigned',
      },
      `Assigned to ${member?.name || 'Staff'}${fieldInstructions ? `: ${fieldInstructions}` : ''}`
    );
  },

  // Team Management from Backend
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const res = await apiClient.get('/admin/team');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        _cachedTeam = data;
        return data;
      }
      return _cachedTeam;
    } catch (e) {
      console.error('[adminService] Backend /admin/team call failed:', e);
      return _cachedTeam;
    }
  },

  async addTeamMember(member: {
    name: string;
    role: string;
    phone: string;
    zone: string;
  }): Promise<TeamMember> {
    try {
      const res = await apiClient.post('/admin/team', member);
      const data = res.data?.data || res.data;
      if (data && data.id) {
        _cachedTeam.push(data);
        return data;
      }
    } catch (e) {
      console.error('[adminService] Backend POST /admin/team call failed:', e);
    }

    const fallbackMember: TeamMember = {
      id: `tm-${Date.now().toString(36)}`,
      name: member.name,
      role: member.role as any,
      phone: member.phone,
      zone: member.zone,
      activeTasks: 0,
      completedThisWeek: 0,
      avgTurnaroundHrs: 3.5,
      initials: member.name.slice(0, 2).toUpperCase(),
    };
    _cachedTeam.push(fallbackMember);
    return fallbackMember;
  },

  // Live Listings from backend
  async getListings(): Promise<PropertyRequest[]> {
    try {
      const res = await apiClient.get('/admin/listings');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        return data.map((p) =>
          normalizeRequest({
            id: p.id,
            code: p.id.slice(0, 8).toUpperCase(),
            module:
              p.listingType === 'RENT'
                ? 'rent'
                : p.listingType === 'COMMERCIAL'
                ? 'commercial'
                : 'flat_building',
            title: p.title,
            description: p.description || '',
            locality: p.location,
            city: p.city,
            priceDisplay: p.priceLabel || `₹${(p.price || 0).toLocaleString('en-IN')}`,
            priceNumeric: p.price || 0,
            areaSqFt: p.area || 1200,
            configLabel: `${p.bedrooms || 2} BHK`,
            status: 'published',
            postPublishState: 'live',
            photos: p.images || [],
            images: p.images || [],
            ownerName: p.ownerName,
            ownerPhone: p.ownerPhone,
            ownerEmail: p.ownerEmail,
            submittedAt: p.createdAt,
            verifiedAt: p.verifiedAt,
            auditLog: [],
            documents: [],
          } as any)
        );
      }
      return [];
    } catch (e) {
      console.error('[adminService] Backend /admin/listings call failed:', e);
      return [];
    }
  },

  // Unpublish a listing back to review
  async unpublishListing(id: string): Promise<void> {
    await apiClient.post(`/admin/properties/${id}/unpublish`);
  },

  // Delete property permanently
  async deleteProperty(id: string): Promise<void> {
    await apiClient.delete(`/admin/properties/${id}`);
  },

  // Reports from backend
  async getReports() {
    try {
      const res = await apiClient.get('/admin/reports');
      return res.data?.data || res.data;
    } catch (e) {
      console.error('[adminService] Backend /admin/reports call failed:', e);
      return null;
    }
  },

  // Service Areas
  getServiceAreas(): ServiceArea[] {
    return INITIAL_SERVICE_AREAS.map((a) => ({
      ...a,
      hubName: a.hubName || a.name,
      serviceRadiusKm: a.serviceRadiusKm || 15,
    }));
  },

  getRejectionTemplates(): RejectionTemplate[] {
    return INITIAL_REJECTION_TEMPLATES.map((t) => ({
      ...t,
      label: t.title,
      template: t.body,
    }));
  },

  // Notifications from backend
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const res = await apiClient.get('/admin/notifications');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        _cachedNotifications = data.map((n) => ({
          ...n,
          read: n.read ?? false,
          timestamp: n.time || n.timestamp || new Date().toISOString(),
          message: n.message || n.title,
        }));
        return _cachedNotifications;
      }
      return _cachedNotifications;
    } catch (e) {
      console.error('[adminService] Backend /admin/notifications call failed:', e);
      return _cachedNotifications;
    }
  },

  markNotificationRead(id: string): void {
    _cachedNotifications = _cachedNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  },

  markAllNotificationsRead(): void {
    _cachedNotifications = _cachedNotifications.map((n) => ({ ...n, read: true }));
  },

  // Healthcheck verification
  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await apiClient.get('/admin/overview', { timeout: 3000 });
      return res.status === 200;
    } catch {
      return false;
    }
  },
};
