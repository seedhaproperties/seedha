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
  INITIAL_REQUESTS,
  TEAM_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SERVICE_AREAS,
  INITIAL_REJECTION_TEMPLATES,
} from '../data/mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

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

// Local persistence cache
const STORAGE_KEYS = {
  REQUESTS: 'seedha_admin_requests_v2',
  TEAM: 'seedha_admin_team_v2',
  NOTIFICATIONS: 'seedha_admin_notifications_v2',
};

// Normalize request object for complete UI safety
export function normalizeRequest(req: PropertyRequest): PropertyRequest {
  const team = getStoredData<TeamMember[]>(STORAGE_KEYS.TEAM, TEAM_MEMBERS);
  const assigned = req.assignedTo || (req.assignedToId ? team.find((t) => t.id === req.assignedToId) : undefined);

  return {
    ...req,
    ownerName: req.ownerName || req.ownerOrUser?.name || 'Owner',
    ownerPhone: req.ownerPhone || req.ownerOrUser?.phone || '+91 98480 00000',
    ownerEmail: req.ownerEmail || req.ownerOrUser?.email || '',
    slaDeadlineMinutes: req.slaDeadlineMinutes !== undefined ? req.slaDeadlineMinutes : req.slaMinutesLeft,
    photos: req.photos || req.images || [],
    assignedTo: assigned,
  };
}

function getStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// Initialize stored data if not present
if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
  setStoredData(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
}
if (!localStorage.getItem(STORAGE_KEYS.TEAM)) {
  setStoredData(STORAGE_KEYS.TEAM, TEAM_MEMBERS);
}
if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
  setStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

export const adminService = {
  // Fetch summary metrics
  async getMetrics() {
    try {
      const res = await apiClient.get('/admin/overview');
      return res.data?.data || res.data;
    } catch {
      const requests = this.getRequestsSync();
      const newCount = requests.filter((r) => r.status === 'new').length;
      const inReviewCount = requests.filter(
        (r) => r.status === 'in_review' || r.status === 'assigned' || r.status === 'field_visit'
      ).length;
      const verifiedCount = requests.filter((r) => r.status === 'verified').length;
      const publishedCount = requests.filter((r) => r.status === 'published').length;
      const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

      return {
        totalRequests: requests.length,
        newRequests: newCount,
        inReview: inReviewCount,
        verified: verifiedCount,
        published: publishedCount,
        rejected: rejectedCount,
        slaAlerts: requests.filter((r) => (r.slaDeadlineMinutes ?? r.slaMinutesLeft) <= 60 && r.status !== 'published' && r.status !== 'rejected').length,
      };
    }
  },

  // Synchronous local state helper
  getRequestsSync(): PropertyRequest[] {
    const raw = getStoredData<PropertyRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    return raw.map(normalizeRequest);
  },

  // Get all property / service requests
  async getRequests(filters?: {
    module?: ModuleType | 'all';
    status?: RequestStatus | 'all';
    search?: string;
  }): Promise<PropertyRequest[]> {
    let requests = this.getRequestsSync();

    if (filters?.module && filters.module !== 'all') {
      requests = requests.filter((r) => r.module === filters.module);
    }
    if (filters?.status && filters.status !== 'all') {
      requests = requests.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.ownerOrUser?.name.toLowerCase().includes(q) ||
          r.ownerOrUser?.phone.includes(q) ||
          r.locality.toLowerCase().includes(q)
      );
    }

    return requests;
  },

  // Get single request by ID
  async getRequestById(id: string): Promise<PropertyRequest | null> {
    const list = this.getRequestsSync();
    return list.find((r) => r.id === id) || null;
  },

  // Update request state
  async updateRequest(
    id: string,
    updater: Partial<PropertyRequest>,
    auditNote?: string,
    performedBy: string = 'Admin Ops'
  ): Promise<PropertyRequest> {
    const list = this.getRequestsSync();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Request ${id} not found`);
    }

    const current = list[idx];
    const newAuditLog: AuditLogEntry[] = [...current.auditLog];

    if (auditNote) {
      newAuditLog.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: auditNote,
        actor: performedBy,
        detail: updater.status ? `Status changed to ${updater.status}` : undefined,
      });
    }

    const updated: PropertyRequest = {
      ...current,
      ...updater,
      auditLog: newAuditLog,
      updatedAt: new Date().toISOString(),
    };

    list[idx] = updated;
    setStoredData(STORAGE_KEYS.REQUESTS, list);

    // Attempt backend sync in background
    try {
      if (updater.status === 'verified' || updater.status === 'published') {
        await apiClient.post(`/admin/properties/${id}/verify-and-publish`, {
          note: auditNote,
        });
      } else if (updater.status === 'rejected') {
        await apiClient.post(`/admin/properties/${id}/reject`, {
          reason: updater.rejectionReason || auditNote,
        });
      }
    } catch {
      // Local state is preserved
    }

    return normalizeRequest(updated);
  },

  // Assign Team Member
  async assignTeamMember(
    requestId: string,
    memberId: string,
    fieldInstructions?: string
  ): Promise<PropertyRequest> {
    const team = this.getTeamMembers();
    const member = team.find((t) => t.id === memberId);
    if (!member) throw new Error('Team member not found');

    member.activeTasks += 1;
    setStoredData(STORAGE_KEYS.TEAM, team);

    return this.updateRequest(
      requestId,
      {
        assignedToId: member.id,
        assignedTo: member,
        status: 'assigned',
        fieldVisit: {
          ...this.getRequestsSync().find((r) => r.id === requestId)?.fieldVisit!,
          scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          agentName: member.name,
          agentPhone: member.phone,
          status: 'SCHEDULED',
          notes: fieldInstructions || '',
        },
      },
      `Assigned to ${member.name} (${member.role})${fieldInstructions ? `: ${fieldInstructions}` : ''}`
    );
  },

  // Team Management
  getTeamMembers(): TeamMember[] {
    return getStoredData<TeamMember[]>(STORAGE_KEYS.TEAM, TEAM_MEMBERS);
  },

  async addTeamMember(member: Omit<TeamMember, 'id' | 'completedThisWeek' | 'avgTurnaroundHrs' | 'initials'>): Promise<TeamMember> {
    const team = this.getTeamMembers();
    const initials = member.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newMember: TeamMember = {
      ...member,
      id: `tm-${Date.now().toString(36)}`,
      completedThisWeek: 0,
      avgTurnaroundHrs: 4.2,
      initials,
    };
    team.push(newMember);
    setStoredData(STORAGE_KEYS.TEAM, team);
    return newMember;
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

  // Notifications
  getNotifications(): AppNotification[] {
    const list = getStoredData<AppNotification[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS
    );
    return list.map((n) => ({
      ...n,
      read: n.read ?? !n.unread,
      timestamp: n.timestamp || n.time || new Date().toISOString(),
      message: n.message || n.body,
    }));
  },

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true, unread: false } : n));
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  markAllNotificationsRead(): void {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true, unread: false }));
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  // Reset to initial mock data
  resetDemoData(): void {
    setStoredData(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    setStoredData(STORAGE_KEYS.TEAM, TEAM_MEMBERS);
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
};
