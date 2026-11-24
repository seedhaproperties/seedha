import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service.js';
export interface SendPushNotificationResult {
    success: boolean;
    totalDevices: number;
    sentCount: number;
    failureCount: number;
    cleanedTokens: number;
    message?: string;
}
export declare class FirebaseNotificationService implements OnModuleInit {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    private firebaseApp;
    private isConfigured;
    private notificationHistory;
    recordNotification(item: {
        userId?: string;
        type: 'message' | 'visit' | 'property' | 'loan' | 'verified';
        title: string;
        body: string;
        screen?: string;
        params?: any;
        unread?: boolean;
    }): {
        id: string;
        userId: string | undefined;
        type: "property" | "message" | "verified" | "visit" | "loan";
        title: string;
        body: string;
        time: string;
        unread: boolean;
        screen: string | undefined;
        params: any;
        createdAt: Date;
    };
    getUserNotificationFeed(userId?: string): Promise<any[]>;
    constructor(configService: ConfigService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private initFirebaseAdmin;
    checkHealth(): Promise<{
        status: 'connected' | 'simulated' | 'error';
        configured: boolean;
        projectId?: string;
        clientEmail?: string;
        tokenValid?: boolean;
        expiresIn?: number;
        timestamp: string;
        error?: string;
    }>;
    sendTestNotification(token: string, title?: string, body?: string, data?: Record<string, string>): Promise<{
        success: boolean;
        messageId?: string;
        errorCode?: string;
        message?: string;
        timestamp: string;
    }>;
    registerDeviceToken(userId: string, token: string, platform?: string): Promise<{
        success: boolean;
        message: string;
        deviceTokenId: string;
    }>;
    unregisterDeviceToken(userId: string, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendToUser(userId: string, payload: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<SendPushNotificationResult>;
    sendToUsers(userIds: string[], payload: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<SendPushNotificationResult>;
    private sendMulticastToTokens;
    getDeviceTokensForUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        token: string;
        platform: string;
    }[]>;
    sendAnnouncement(title: string, body: string, data?: Record<string, string>): Promise<SendPushNotificationResult>;
    sendPropertyEnquiryNotification(ownerId: string, propertyTitle: string, customerName: string, message: string, propertyId: string): Promise<SendPushNotificationResult>;
    sendPropertyStatusNotification(ownerId: string, propertyTitle: string, status: 'APPROVED' | 'REJECTED', reason?: string, propertyId?: string): Promise<SendPushNotificationResult>;
    sendBookingConfirmationNotification(userId: string, propertyTitle: string, date: string, timeSlot: string, propertyId: string, visitId: string): Promise<SendPushNotificationResult>;
    sendPaymentNotification(userId: string, amount: number, purpose: string, status: 'SUCCESS' | 'FAILED', txnId: string, reason?: string): Promise<SendPushNotificationResult>;
}
