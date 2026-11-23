var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseNotificationService_1;
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, applicationDefault, getApps, getApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaService } from '../../database/prisma.service.js';
let FirebaseNotificationService = FirebaseNotificationService_1 = class FirebaseNotificationService {
    configService;
    prisma;
    logger = new Logger(FirebaseNotificationService_1.name);
    firebaseApp = null;
    isConfigured = false;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    async onModuleInit() {
        this.initFirebaseAdmin();
    }
    initFirebaseAdmin() {
        const existingApps = getApps();
        if (existingApps.length > 0) {
            this.firebaseApp = getApp();
            this.isConfigured = true;
            this.logger.log('🔥 Reusing existing Firebase Admin App instance');
            return;
        }
        const projectId = this.configService.get('FIREBASE_PROJECT_ID') || process.env.FIREBASE_PROJECT_ID;
        const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL') || process.env.FIREBASE_CLIENT_EMAIL;
        const rawPrivateKey = this.configService.get('FIREBASE_PRIVATE_KEY') || process.env.FIREBASE_PRIVATE_KEY;
        const credentialsPath = this.configService.get('FIREBASE_CREDENTIALS_PATH') ||
            process.env.FIREBASE_CREDENTIALS_PATH;
        const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT_JSON') ||
            process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        try {
            if (projectId && clientEmail && rawPrivateKey) {
                const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
                this.firebaseApp = initializeApp({
                    credential: cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
                this.isConfigured = true;
                this.logger.log(`🔥 Firebase Admin SDK initialized successfully for project: ${projectId}`);
                return;
            }
            if (serviceAccountJson) {
                const parsed = JSON.parse(serviceAccountJson);
                this.firebaseApp = initializeApp({
                    credential: cert(parsed),
                });
                this.isConfigured = true;
                this.logger.log(`🔥 Firebase Admin SDK initialized from JSON for project: ${parsed.project_id || 'configured'}`);
                return;
            }
            let resolvedPath = credentialsPath ? path.resolve(credentialsPath) : '';
            if (credentialsPath && !fs.existsSync(resolvedPath)) {
                const backendRelative = path.resolve(process.cwd(), 'backend', credentialsPath);
                if (fs.existsSync(backendRelative)) {
                    resolvedPath = backendRelative;
                }
            }
            if (resolvedPath && fs.existsSync(resolvedPath)) {
                const fileContent = fs.readFileSync(resolvedPath, 'utf8');
                const parsed = JSON.parse(fileContent);
                this.firebaseApp = initializeApp({
                    credential: cert(parsed),
                });
                this.isConfigured = true;
                this.logger.log(`🔥 Firebase Admin SDK initialized from file: ${resolvedPath} (${parsed.project_id})`);
                return;
            }
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                this.firebaseApp = initializeApp({
                    credential: applicationDefault(),
                });
                this.isConfigured = true;
                this.logger.log('🔥 Firebase Admin SDK initialized with Google Application Default Credentials');
                return;
            }
            this.isConfigured = false;
            this.logger.log('ℹ️ Firebase credentials not provided (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Operating in simulation mode (push notifications will be logged to console).');
        }
        catch (err) {
            this.isConfigured = false;
            this.logger.error(`❌ Failed to initialize Firebase Admin SDK: ${err.message}`, err.stack);
        }
    }
    async checkHealth() {
        const timestamp = new Date().toISOString();
        if (!this.isConfigured || !this.firebaseApp) {
            return {
                status: 'simulated',
                configured: false,
                timestamp,
            };
        }
        try {
            const tokenResult = await this.firebaseApp.options.credential?.getAccessToken();
            const projectId = this.firebaseApp.options.projectId;
            const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL') ||
                process.env.FIREBASE_CLIENT_EMAIL ||
                'configured';
            return {
                status: 'connected',
                configured: true,
                projectId,
                clientEmail,
                tokenValid: !!tokenResult?.access_token,
                expiresIn: tokenResult?.expires_in,
                timestamp,
            };
        }
        catch (err) {
            this.logger.error(`❌ Firebase connection health check failed: ${err.message}`);
            return {
                status: 'error',
                configured: this.isConfigured,
                timestamp,
                error: err.message,
            };
        }
    }
    async sendTestNotification(token, title, body, data) {
        const cleanToken = token.trim();
        if (!cleanToken) {
            throw new BadRequestException('Target FCM device token cannot be empty');
        }
        const timestamp = new Date().toISOString();
        const notificationTitle = title || 'Seedha Properties Test Alert 🔔';
        const notificationBody = body || 'This is a test notification verifying live Firebase Admin SDK delivery.';
        if (!this.isConfigured || !this.firebaseApp) {
            this.logger.log(`[FCM SIMULATION TEST] To token: ${cleanToken.slice(0, 10)}... Title: "${notificationTitle}" Body: "${notificationBody}"`);
            return {
                success: true,
                messageId: `simulated_msg_${Date.now()}`,
                message: 'Notification simulated (Firebase credentials not in live mode)',
                timestamp,
            };
        }
        const sanitizedData = {};
        if (data) {
            for (const [key, val] of Object.entries(data)) {
                sanitizedData[key] = String(val);
            }
        }
        const message = {
            token: cleanToken,
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            data: sanitizedData,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'seedha_notifications',
                    priority: 'high',
                    defaultVibrateTimings: true,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };
        try {
            const messaging = getMessaging(this.firebaseApp);
            const messageId = await messaging.send(message);
            this.logger.log(`✅ Test FCM notification sent successfully! Message ID: ${messageId}`);
            return {
                success: true,
                messageId,
                timestamp,
            };
        }
        catch (err) {
            const errorCode = err.code || 'messaging/unknown-error';
            this.logger.warn(`⚠️ Test FCM notification error: [${errorCode}] ${err.message}`);
            return {
                success: false,
                errorCode,
                message: err.message,
                timestamp,
            };
        }
    }
    async registerDeviceToken(userId, token, platform = 'android') {
        const cleanToken = token.trim();
        if (!cleanToken) {
            throw new BadRequestException('FCM device token cannot be empty');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with id '${userId}' not found`);
        }
        const record = await this.prisma.deviceToken.upsert({
            where: { token: cleanToken },
            update: {
                userId,
                platform: platform.toLowerCase(),
                updatedAt: new Date(),
            },
            create: {
                userId,
                token: cleanToken,
                platform: platform.toLowerCase(),
            },
        });
        this.logger.log(`📲 Registered device token for user: ${user.email} (${userId}) [Platform: ${platform}]`);
        return {
            success: true,
            message: 'FCM device token registered successfully',
            deviceTokenId: record.id,
        };
    }
    async unregisterDeviceToken(userId, token) {
        const cleanToken = token.trim();
        try {
            await this.prisma.deviceToken.deleteMany({
                where: {
                    token: cleanToken,
                    userId,
                },
            });
            this.logger.log(`📲 Unregistered device token for user: ${userId}`);
            return {
                success: true,
                message: 'FCM device token unregistered successfully',
            };
        }
        catch (err) {
            this.logger.warn(`Failed unregistering token for user ${userId}: ${err.message}`);
            return {
                success: false,
                message: 'Device token was not found or already removed',
            };
        }
    }
    async sendToUser(userId, payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { deviceTokens: true },
        });
        if (!user) {
            throw new NotFoundException(`User with id '${userId}' not found`);
        }
        const tokens = user.deviceTokens.map((d) => d.token);
        if (tokens.length === 0) {
            this.logger.warn(`[SendToUser] No registered device tokens found for user ${user.email} (${userId})`);
            return {
                success: false,
                totalDevices: 0,
                sentCount: 0,
                failureCount: 0,
                cleanedTokens: 0,
                message: 'No registered devices found for target user',
            };
        }
        return this.sendMulticastToTokens(tokens, payload, `User: ${user.email} (${userId})`);
    }
    async sendToUsers(userIds, payload) {
        if (!userIds || userIds.length === 0) {
            throw new BadRequestException('At least one user ID must be provided');
        }
        const deviceRecords = await this.prisma.deviceToken.findMany({
            where: { userId: { in: userIds } },
        });
        const tokens = deviceRecords.map((d) => d.token);
        if (tokens.length === 0) {
            return {
                success: false,
                totalDevices: 0,
                sentCount: 0,
                failureCount: 0,
                cleanedTokens: 0,
                message: 'No active device tokens found for the specified users',
            };
        }
        return this.sendMulticastToTokens(tokens, payload, `${userIds.length} users`);
    }
    async sendMulticastToTokens(tokens, payload, targetDescription) {
        const totalDevices = tokens.length;
        if (!this.isConfigured || !this.firebaseApp) {
            this.logger.log(`[FCM SIMULATION] Push notification to ${targetDescription} (${totalDevices} devices):
  Title: "${payload.title}"
  Body: "${payload.body}"
  Data: ${JSON.stringify(payload.data || {})}`);
            return {
                success: true,
                totalDevices,
                sentCount: totalDevices,
                failureCount: 0,
                cleanedTokens: 0,
                message: 'Notification processed in simulation mode (credentials not configured)',
            };
        }
        const sanitizedData = {};
        if (payload.data) {
            for (const [key, val] of Object.entries(payload.data)) {
                sanitizedData[key] = String(val);
            }
        }
        const message = {
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: sanitizedData,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'seedha_notifications',
                    priority: 'high',
                    defaultVibrateTimings: true,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };
        try {
            const messaging = getMessaging(this.firebaseApp);
            const response = await messaging.sendEachForMulticast(message);
            const sentCount = response.successCount;
            const failureCount = response.failureCount;
            const deadTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error) {
                    const code = resp.error.code;
                    if (code === 'messaging/invalid-registration-token' ||
                        code === 'messaging/registration-token-not-registered') {
                        deadTokens.push(tokens[idx]);
                    }
                    else {
                        this.logger.warn(`FCM delivery error for device ${tokens[idx].slice(-8)}: ${resp.error.message}`);
                    }
                }
            });
            let cleanedTokens = 0;
            if (deadTokens.length > 0) {
                const deleteResult = await this.prisma.deviceToken.deleteMany({
                    where: { token: { in: deadTokens } },
                });
                cleanedTokens = deleteResult.count;
                this.logger.log(`🧹 Cleaned up ${cleanedTokens} expired/invalid FCM device tokens`);
            }
            this.logger.log(`📢 Push Notification Sent to ${targetDescription} - Success: ${sentCount}, Failed: ${failureCount}, Cleaned: ${cleanedTokens}`);
            return {
                success: sentCount > 0 || failureCount === 0,
                totalDevices,
                sentCount,
                failureCount,
                cleanedTokens,
            };
        }
        catch (err) {
            this.logger.error(`❌ FCM multicast delivery failed: ${err.message}`, err.stack);
            return {
                success: false,
                totalDevices,
                sentCount: 0,
                failureCount: totalDevices,
                cleanedTokens: 0,
                message: err.message,
            };
        }
    }
    async getDeviceTokensForUser(userId) {
        return this.prisma.deviceToken.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
};
FirebaseNotificationService = FirebaseNotificationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        PrismaService])
], FirebaseNotificationService);
export { FirebaseNotificationService };
//# sourceMappingURL=firebase-notification.service.js.map