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
}
