import { FirebaseNotificationService } from './firebase-notification.service.js';
import { RegisterDeviceTokenDto, UnregisterDeviceTokenDto } from './dto/register-token.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { SendMulticastNotificationDto } from './dto/send-multicast.dto.js';
import { TestNotificationDto } from './dto/test-notification.dto.js';
export declare class FirebaseNotificationController {
    private readonly notificationService;
    constructor(notificationService: FirebaseNotificationService);
    checkHealth(): Promise<{
        status: "connected" | "simulated" | "error";
        configured: boolean;
        projectId?: string;
        clientEmail?: string;
        tokenValid?: boolean;
        expiresIn?: number;
        timestamp: string;
        error?: string;
    }>;
    getFeed(req: any): Promise<any[]>;
    sendTestToken(dto: TestNotificationDto): Promise<{
        success: boolean;
        messageId?: string;
        errorCode?: string;
        message?: string;
        timestamp: string;
    }>;
    registerDeviceToken(req: any, dto: RegisterDeviceTokenDto): Promise<{
        success: boolean;
        message: string;
        deviceTokenId: string;
    } | {
        success: boolean;
        message: string;
    }>;
    unregisterDeviceToken(req: any, dto: UnregisterDeviceTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMyDevices(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        token: string;
        platform: string;
    }[]>;
    sendToUser(dto: SendNotificationDto): Promise<import("./firebase-notification.service.js").SendPushNotificationResult>;
    sendMulticast(dto: SendMulticastNotificationDto): Promise<import("./firebase-notification.service.js").SendPushNotificationResult>;
    broadcastAnnouncement(dto: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<import("./firebase-notification.service.js").SendPushNotificationResult>;
}
