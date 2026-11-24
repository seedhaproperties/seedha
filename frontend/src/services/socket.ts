import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { getHost } from './api';

export interface PropertyStatusEvent {
  eventId: string;
  timestamp: string;
  propertyId: string;
  ownerId?: string;
  status: string;
  verified: boolean;
  rejectionReason?: string;
  listingType?: string;
  propertyType?: string;
  title: string;
  message: string;
}

type PropertyStatusListener = (event: PropertyStatusEvent) => void;

class UserSocketService {
  private socket: Socket | null = null;
  private statusListeners = new Set<PropertyStatusListener>();
  private processedEvents = new Set<string>();

  public getSocketUrl(): string {
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')
    ) {
      return `http://${window.location.hostname}:4000`;
    }
    if (process.env.EXPO_PUBLIC_SOCKET_URL) {
      return process.env.EXPO_PUBLIC_SOCKET_URL;
    }
    const host = getHost();
    return `http://${host}:4000`;
  }

  public connect(userId?: string, token?: string): Socket {
    if (this.socket && this.socket.connected) {
      if (userId) {
        this.socket.emit('user:identify', { userId, token });
      }
      return this.socket;
    }

    const serverUrl = this.getSocketUrl();

    this.socket = io(serverUrl, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: {
        token: token || 'dev-user-token',
        userId: userId || 'user_guest',
        role: 'USER',
      },
    });

    this.socket.on('connect', () => {
      console.log('⚡ [UserSocket] Connected to NestJS Socket.IO Server:', this.socket?.id);
      if (userId) {
        this.socket?.emit('user:identify', { userId, token });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [UserSocket] Disconnected:', reason);
    });

    this.socket.on('property:status-updated', (payload: PropertyStatusEvent) => {
      if (!payload || !payload.propertyId) return;
      if (this.isDuplicate(payload.eventId)) return;

      console.log('📢 [UserSocket] Property status update received:', payload.title, payload.status);

      this.statusListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (e) {
          console.error('[UserSocket] Listener execution error:', e);
        }
      });
    });

    return this.socket;
  }

  private isDuplicate(eventId?: string): boolean {
    if (!eventId) return false;
    if (this.processedEvents.has(eventId)) return true;
    this.processedEvents.add(eventId);
    if (this.processedEvents.size > 200) {
      const oldest = Array.from(this.processedEvents).slice(0, 50);
      oldest.forEach((id) => this.processedEvents.delete(id));
    }
    return false;
  }

  public onStatusUpdated(listener: PropertyStatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const userSocket = new UserSocketService();
