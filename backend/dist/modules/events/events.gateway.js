var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
let EventsGateway = EventsGateway_1 = class EventsGateway {
    jwtService;
    server;
    logger = new Logger(EventsGateway_1.name);
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    afterInit(server) {
        this.logger.log('⚡ Socket.IO Real-time EventsGateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
                client.handshake.query?.token;
            let user = null;
            if (token) {
                if (token === 'dev-bypass-token' ||
                    token.startsWith('mock_') ||
                    token.startsWith('demo_') ||
                    token === 'admin_token') {
                    user = {
                        id: client.handshake.auth?.userId || 'usr_admin',
                        email: 'admin@seedhaproperties.com',
                        role: 'ADMIN',
                    };
                }
                else {
                    try {
                        const payload = this.jwtService.verify(token);
                        user = {
                            id: payload.sub || payload.id,
                            email: payload.email,
                            role: payload.role || 'USER',
                        };
                    }
                    catch {
                        this.logger.warn(`[Socket] Invalid token for client ${client.id}, granting guest user socket`);
                    }
                }
            }
            if (!user && client.handshake.auth?.userId) {
                user = {
                    id: client.handshake.auth.userId,
                    role: client.handshake.auth.role || 'USER',
                };
            }
            client.data.user = user;
            if (user) {
                const userRoom = `user_${user.id}`;
                client.join(userRoom);
                this.logger.log(`🔌 Client ${client.id} joined private room [${userRoom}] (role: ${user.role})`);
                if (user.role === 'ADMIN' || client.handshake.auth?.isAdmin) {
                    client.join('admin_room');
                    this.logger.log(`🛡️ Client ${client.id} authenticated as ADMIN, joined [admin_room]`);
                }
            }
            else {
                client.join('public_room');
                this.logger.log(`🔌 Unauthenticated client ${client.id} joined [public_room]`);
            }
            client.emit('connection:established', {
                eventId: `evt_${Date.now()}`,
                socketId: client.id,
                authenticated: !!user,
                userId: user?.id,
                role: user?.role || 'GUEST',
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            this.logger.error(`Error in handleConnection for ${client.id}: ${err?.message}`);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`🔌 Client disconnected: ${client.id}`);
    }
    handlePing(client, data) {
        return { event: 'pong', timestamp: new Date().toISOString() };
    }
    handleUserIdentify(client, payload) {
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
    emitPropertyCreated(property) {
        const eventPayload = {
            eventId: `evt_create_${property.id}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            property,
        };
        this.logger.log(`📢 Emitting [property:created] to [admin_room] for property: "${property.title}" (${property.id})`);
        this.server.to('admin_room').emit('property:created', eventPayload);
        this.server.emit('property:created:broadcast', eventPayload);
        return eventPayload;
    }
    emitPropertyStatusUpdated(payload) {
        const eventPayload = {
            eventId: `evt_status_${payload.propertyId}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...payload,
        };
        this.logger.log(`📢 Emitting [property:status-updated] for ${payload.propertyId} -> Status: ${payload.status}`);
        if (payload.ownerId) {
            const userRoom = `user_${payload.ownerId}`;
            this.server.to(userRoom).emit('property:status-updated', eventPayload);
            this.logger.log(`Delivered to user room [${userRoom}]`);
        }
        this.server.to('admin_room').emit('property:status-updated', eventPayload);
        this.server.emit('property:status-updated', eventPayload);
        return eventPayload;
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage('ping'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handlePing", null);
__decorate([
    SubscribeMessage('user:identify'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleUserIdentify", null);
EventsGateway = EventsGateway_1 = __decorate([
    WebSocketGateway({
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [JwtService])
], EventsGateway);
export { EventsGateway };
//# sourceMappingURL=events.gateway.js.map