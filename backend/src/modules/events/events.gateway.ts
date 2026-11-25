import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

export interface PropertyCreatedEvent {
  eventId: string;
  timestamp: string;
  property: any;
}

export interface PropertyStatusUpdatedEvent {
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

@WebSocketGateway({
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, origin?: any) => void) => {
      callback(null, origin || true);
    },
    credentials: true,
  },
  transports: ['polling', 'websocket'],
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('⚡ Socket.IO Real-time EventsGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // 1. Extract token from handshake auth, query, or authorization header
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
        client.handshake.query?.token;

      let user: { id: string; email?: string; role?: string } | null = null;

      if (token) {
        if (
          token === 'dev-bypass-token' ||
          token.startsWith('mock_') ||
          token.startsWith('demo_') ||
          token === 'admin_token'
        ) {
          // Dev / Admin test tokens
          user = {
            id: client.handshake.auth?.userId || 'usr_admin',
            email: 'admin@seedhaproperties.com',
            role: 'ADMIN',
          };
        } else {
          try {
            const payload: any = this.jwtService.verify(token);
            user = {
              id: payload.sub || payload.id,
              email: payload.email,
              role: payload.role || 'USER',
            };
          } catch {
            this.logger.warn(
              `[Socket] Invalid token for client ${client.id}, granting guest user socket`,
            );
          }
        }
      }

      // If user provided a direct userId in handshake auth (e.g. mobile app guest or dev login)
      if (!user && client.handshake.auth?.userId) {
        user = {
          id: client.handshake.auth.userId,
          role: client.handshake.auth.role || 'USER',
        };
      }

      // Attach user info to socket instance
      client.data.user = user;

      // 2. Role-based and user-specific room joining
      if (user) {
        // Individual user room for private real-time notifications
        const userRoom = `user_${user.id}`;
        client.join(userRoom);
        this.logger.log(
          `🔌 Client ${client.id} joined private room [${userRoom}] (role: ${user.role})`,
        );

        // Admin room for real-time dashboard review updates
        if (user.role === 'ADMIN' || client.handshake.auth?.isAdmin) {
          client.join('admin_room');
          this.logger.log(
            `🛡️ Client ${client.id} authenticated as ADMIN, joined [admin_room]`,
          );
        }
      } else {
        // Unauthenticated client (can listen to public broadcasts)
        client.join('public_room');
        this.logger.log(`🔌 Unauthenticated client ${client.id} joined [public_room]`);
      }

      // Acknowledge connection to client with active session info
      client.emit('connection:established', {
        eventId: `evt_${Date.now()}`,
        socketId: client.id,
        authenticated: !!user,
        userId: user?.id,
        role: user?.role || 'GUEST',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.error(`Error in handleConnection for ${client.id}: ${err?.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Client disconnected: ${client.id}`);
  }

  // Client heartbeat / ping
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return { event: 'pong', timestamp: new Date().toISOString() };
  }

  // Client requests to join a specific user room (e.g. after login)
  @SubscribeMessage('user:identify')
  handleUserIdentify(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; token?: string; isAdmin?: boolean },
  ) {
    if (payload?.userId) {
      const room = `user_${payload.userId}`;
      client.join(room);
      client.data.user = {
        id: payload.userId,
        role: payload.isAdmin ? 'ADMIN' : 'USER',
      };
      if (payload.isAdmin) {
        client.join('admin_room');
      }
      this.logger.log(`Client ${client.id} identified as user ${payload.userId}`);
      return { success: true, room, isAdmin: !!payload.isAdmin };
    }
    return { success: false, message: 'userId required' };
  }

  /**
   * Emit `property:created` to all connected admin clients
   * Triggered when any user submits a property through PostProperty
   */
  emitPropertyCreated(property: any) {
    const eventPayload: PropertyCreatedEvent = {
      eventId: `evt_create_${property.id}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      property,
    };

    this.logger.log(
      `📢 Emitting [property:created] to [admin_room] for property: "${property.title}" (${property.id})`,
    );

    // Emit to admin clients room
    this.server.to('admin_room').emit('property:created', eventPayload);

    // Also broadcast to root server so any open dashboard without room sync catches it
    this.server.emit('property:created:broadcast', eventPayload);

    return eventPayload;
  }

  /**
   * Emit `property:status-updated` to respective owner and admin clients
   * Triggered on admin approve, reject, unpublish, or verification update
   */
  emitPropertyStatusUpdated(payload: {
    propertyId: string;
    ownerId?: string;
    status: string;
    verified: boolean;
    rejectionReason?: string;
    listingType?: string;
    propertyType?: string;
    title: string;
    message: string;
  }) {
    const eventPayload: PropertyStatusUpdatedEvent = {
      eventId: `evt_status_${payload.propertyId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    this.logger.log(
      `📢 Emitting [property:status-updated] for ${payload.propertyId} -> Status: ${payload.status}`,
    );

    // 1. Deliver to owner user room if ownerId is specified
    if (payload.ownerId) {
      const userRoom = `user_${payload.ownerId}`;
      this.server.to(userRoom).emit('property:status-updated', eventPayload);
      this.logger.log(`Delivered to user room [${userRoom}]`);
    }

    // 2. Deliver to all admins to live-update Admin Dashboard review queues
    this.server.to('admin_room').emit('property:status-updated', eventPayload);

    // 3. Broadcast to all clients so public property listing caches refresh
    this.server.emit('property:status-updated', eventPayload);

    return eventPayload;
  }
}
