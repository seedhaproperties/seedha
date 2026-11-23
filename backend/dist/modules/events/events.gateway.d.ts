import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
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
    title: string;
    message: string;
}
export declare class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handlePing(client: Socket, data: any): {
        event: string;
        timestamp: string;
    };
    handleUserIdentify(client: Socket, payload: {
        userId: string;
        token?: string;
        isAdmin?: boolean;
    }): {
        success: boolean;
        room: string;
        isAdmin: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        room?: undefined;
        isAdmin?: undefined;
    };
    emitPropertyCreated(property: any): PropertyCreatedEvent;
    emitPropertyStatusUpdated(payload: {
        propertyId: string;
        ownerId?: string;
        status: string;
        verified: boolean;
        rejectionReason?: string;
        title: string;
        message: string;
    }): PropertyStatusUpdatedEvent;
}
