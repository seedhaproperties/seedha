import { io, Socket } from 'socket.io-client';
import { adminService, normalizeRequest } from './api';
import { PropertyRequest } from '../types';

export interface PropertyCreatedSocketPayload {
  eventId: string;
  timestamp: string;
  property: any;
}

export interface PropertyStatusUpdatedSocketPayload {
  eventId: string;
  timestamp: string;
  propertyId: string;
  ownerId?: string;
  status: string;
  verified: boolean;
  rejectionReason?: string;
  title: string;
  message: string;
}

type PropertyCreatedListener = (request: PropertyRequest) => void;
type PropertyStatusListener = (payload: PropertyStatusUpdatedSocketPayload) => void;
type ConnectionListener = (connected: boolean) => void;
type ReconnectListener = () => void;

class AdminSocketService {
  private socket: Socket | null = null;
  private processedEvents = new Set<string>();
  private maxProcessedEvents = 200;
  private propertyCreatedListeners = new Set<PropertyCreatedListener>();
  private propertyStatusListeners = new Set<PropertyStatusListener>();
  private connectionListeners = new Set<ConnectionListener>();
  private reconnectListeners = new Set<ReconnectListener>();

  public getSocketUrl(): string {
    if ((import.meta as any).env?.VITE_SOCKET_URL) {
      return (import.meta as any).env.VITE_SOCKET_URL;
    }
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:4000`;
    }
    return 'http://localhost:4000';
  }

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token =
      (typeof localStorage !== 'undefined' && localStorage.getItem('seedha_admin_token')) ||
      'admin_token';
    const serverUrl = this.getSocketUrl();

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: {
        token,
        isAdmin: true,
        userId: 'admin_dashboard',
        role: 'ADMIN',
      },
    });

    this.socket.on('connect', () => {
      console.log('⚡ [AdminSocket] Connected to NestJS Socket.IO Server:', this.socket?.id);
      this.connectionListeners.forEach((l) => l(true));
      // Join admin room explicitly
      this.socket?.emit('user:identify', {
        userId: 'admin_dashboard',
        isAdmin: true,
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ [AdminSocket] Disconnected from server:', reason);
      this.connectionListeners.forEach((l) => l(false));
    });

    // Reconnection handling: fetch missed updates from REST API
    this.socket.on('reconnect', async (attemptNumber) => {
      console.log(`🔄 [AdminSocket] Reconnected after ${attemptNumber} attempts. Backfilling missed records...`);
      this.connectionListeners.forEach((l) => l(true));
      try {
        await adminService.getMetrics();
        await adminService.getRequests();
        this.reconnectListeners.forEach((l) => l());
      } catch (err) {
        console.error('Error backfilling after reconnect:', err);
      }
    });

    // Handle real-time property:created
    const handleCreated = (payload: PropertyCreatedSocketPayload) => {
      if (!payload || !payload.property) return;
      if (this.isDuplicateEvent(payload.eventId)) return;

      console.log('📢 [AdminSocket] New property submitted in real-time:', payload.property.title);

      const p = payload.property;
      const isPg =
        p.propertyType?.toLowerCase().includes('pg') ||
        p.propertyType?.toLowerCase().includes('hostel') ||
        p.details?.pgAccommodationType ||
        p.title?.toLowerCase().includes('pg') ||
        p.title?.toLowerCase().includes('hostel');

      const computedModule = isPg
        ? 'pg_hostel'
        : p.listingType === 'RENT'
        ? 'rent'
        : p.listingType === 'COMMERCIAL'
        ? 'commercial'
        : 'flat_building';

      const normalized = normalizeRequest({
        id: payload.property.id,
        code: (payload.property.id || '').slice(0, 8).toUpperCase(),
        module: computedModule,
        title: payload.property.title,
        description: payload.property.description || '',
        subtitle: `${payload.property.bedrooms ? `${payload.property.bedrooms} BHK · ` : ''}${
          payload.property.propertyType || 'Apartment'
        } · ${payload.property.city}`,
        locality: payload.property.location,
        city: payload.property.city,
        state: payload.property.state || 'Telangana',
        pincode: payload.property.pincode || '',
        priceDisplay:
          payload.property.priceLabel ||
          `₹${(payload.property.price || 0).toLocaleString('en-IN')}${
            payload.property.listingType === 'RENT' ? '/mo' : ''
          }`,
        priceNumeric: payload.property.price || 0,
        areaSqFt: payload.property.area || 1200,
        configLabel: `${payload.property.bedrooms || 1} BHK · ${payload.property.bathrooms || 1} Bath`,
        status: 'new',
        postPublishState: 'unpublished',
        slaMinutesLeft: 1440,
        submittedAt: payload.property.createdAt || new Date().toISOString(),
        relativeTime: 'Just now',
        photos: payload.property.images || [],
        images: payload.property.images || [],
        ownerOrUser: {
          name: payload.property.ownerName || 'Property Owner',
          role: 'Owner',
          phone: payload.property.ownerPhone || '',
          email: payload.property.ownerEmail || '',
          whatsapp: payload.property.ownerPhone || '',
        },
        documents: [],
        auditLog: [
          {
            id: `aud-${payload.property.id}-created`,
            actor: 'User Mobile App',
            action: 'Property submitted by owner in real-time',
            timestamp: payload.timestamp || new Date().toISOString(),
          },
        ],
      } as any);

      // Notify all active React listeners
      this.propertyCreatedListeners.forEach((listener) => {
        try {
          listener(normalized);
        } catch (e) {
          console.error('[AdminSocket] Error in listener execution:', e);
        }
      });

      // Dispatch global DOM event for other components (topbar, sidebar)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('seedha:property-created', { detail: normalized })
        );
      }
    };

    this.socket.on('property:created', handleCreated);
    this.socket.on('property:created:broadcast', handleCreated);

    // Handle real-time property:status-updated
    this.socket.on('property:status-updated', (payload: PropertyStatusUpdatedSocketPayload) => {
      if (!payload || !payload.propertyId) return;
      if (this.isDuplicateEvent(payload.eventId)) return;

      console.log(
        `📢 [AdminSocket] Property ${payload.propertyId} status updated to [${payload.status}]`
      );

      this.propertyStatusListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (e) {
          console.error('[AdminSocket] Error in status listener:', e);
        }
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('seedha:property-status-updated', { detail: payload })
        );
      }
    });

    return this.socket;
  }

  private isDuplicateEvent(eventId?: string): boolean {
    if (!eventId) return false;
    if (this.processedEvents.has(eventId)) {
      console.warn(`[AdminSocket] Duplicate event ignored: ${eventId}`);
      return true;
    }
    this.processedEvents.add(eventId);
    if (this.processedEvents.size > this.maxProcessedEvents) {
      const oldest = Array.from(this.processedEvents).slice(0, 50);
      oldest.forEach((id) => this.processedEvents.delete(id));
    }
    return false;
  }

  public onPropertyCreated(listener: PropertyCreatedListener): () => void {
    this.propertyCreatedListeners.add(listener);
    return () => {
      this.propertyCreatedListeners.delete(listener);
    };
  }

  public onPropertyStatusUpdated(listener: PropertyStatusListener): () => void {
    this.propertyStatusListeners.add(listener);
    return () => {
      this.propertyStatusListeners.delete(listener);
    };
  }

  public onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  public onReconnect(listener: ReconnectListener): () => void {
    this.reconnectListeners.add(listener);
    return () => {
      this.reconnectListeners.delete(listener);
    };
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const adminSocket = new AdminSocketService();
