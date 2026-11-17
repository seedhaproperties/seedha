import { Injectable, Logger, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, applicationDefault, getApps, getApp, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage, Message, BatchResponse, SendResponse } from 'firebase-admin/messaging';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaService } from '../../database/prisma.service.js';

export interface SendPushNotificationResult {
  success: boolean;
  totalDevices: number;
  sentCount: number;
  failureCount: number;
  cleanedTokens: number;
  message?: string;
}

@Injectable()
export class FirebaseNotificationService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseNotificationService.name);
  private firebaseApp: App | null = null;
  private isConfigured = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.initFirebaseAdmin();
  }

  /**
   * Initializes Firebase Admin SDK securely using environment variables or service account files.
   * Never hardcodes private keys and never logs sensitive credentials.
   */
  private initFirebaseAdmin() {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.firebaseApp = getApp();
      this.isConfigured = true;
      this.logger.log('🔥 Reusing existing Firebase Admin App instance');
      return;
    }

    const projectId =
      this.configService.get<string>('FIREBASE_PROJECT_ID') || process.env.FIREBASE_PROJECT_ID;
    const clientEmail =
      this.configService.get<string>('FIREBASE_CLIENT_EMAIL') || process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey =
      this.configService.get<string>('FIREBASE_PRIVATE_KEY') || process.env.FIREBASE_PRIVATE_KEY;
    const credentialsPath =
      this.configService.get<string>('FIREBASE_CREDENTIALS_PATH') ||
      process.env.FIREBASE_CREDENTIALS_PATH;
    const serviceAccountJson =
      this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON') ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    try {
      // Option 1: Explicit Environment Variables (Most common for 12-factor cloud deployment)
      if (projectId && clientEmail && rawPrivateKey) {
        // Handle escaped newline characters in private key string
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

      // Option 2: JSON String in Environment Variable
      if (serviceAccountJson) {
        const parsed = JSON.parse(serviceAccountJson);
        this.firebaseApp = initializeApp({
          credential: cert(parsed),
        });
        this.isConfigured = true;
        this.logger.log(
          `🔥 Firebase Admin SDK initialized from JSON for project: ${parsed.project_id || 'configured'}`,
        );
        return;
      }

      // Option 3: Local / Mounted Service Account JSON File Path
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
        this.logger.log(
          `🔥 Firebase Admin SDK initialized from file: ${resolvedPath} (${parsed.project_id})`,
        );
        return;
      }

      // Option 4: GOOGLE_APPLICATION_CREDENTIALS environment variable
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.firebaseApp = initializeApp({
          credential: applicationDefault(),
        });
        this.isConfigured = true;
        this.logger.log('🔥 Firebase Admin SDK initialized with Google Application Default Credentials');
        return;
      }

      // Fallback: Safe Simulation / Development Mode
      this.isConfigured = false;
      this.logger.log(
        'ℹ️ Firebase credentials not provided (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Operating in simulation mode (push notifications will be logged to console).',
      );
    } catch (err: any) {
      this.isConfigured = false;
      this.logger.error(`❌ Failed to initialize Firebase Admin SDK: ${err.message}`, err.stack);
    }
  }

  /**
   * Health-check mechanism to verify live Firebase Admin SDK connection and authentication.
   * Securely requests an OAuth 2.0 access token from Google without exposing private keys.
   */
  async checkHealth(): Promise<{
    status: 'connected' | 'simulated' | 'error';
    configured: boolean;
    projectId?: string;
    clientEmail?: string;
    tokenValid?: boolean;
    expiresIn?: number;
    timestamp: string;
    error?: string;
  }> {
    const timestamp = new Date().toISOString();

    if (!this.isConfigured || !this.firebaseApp) {
      return {
        status: 'simulated',
        configured: false,
        timestamp,
      };
    }

    try {
      // Authenticate with Google identity server to verify private key and service account validity
      const tokenResult = await this.firebaseApp.options.credential?.getAccessToken();
      const projectId = this.firebaseApp.options.projectId;
      const clientEmail =
        this.configService.get<string>('FIREBASE_CLIENT_EMAIL') ||
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
    } catch (err: any) {
      this.logger.error(`❌ Firebase connection health check failed: ${err.message}`);
      return {
        status: 'error',
        configured: this.isConfigured,
        timestamp,
        error: err.message,
      };
    }
  }

  /**
   * Sends a test notification directly to any specified FCM device token.
   * Useful for Swagger testing and verifying individual device connectivity.
   */
  async sendTestNotification(
    token: string,
    title?: string,
    body?: string,
    data?: Record<string, string>,
  ): Promise<{
    success: boolean;
    messageId?: string;
    errorCode?: string;
    message?: string;
    timestamp: string;
  }> {
    const cleanToken = token.trim();
    if (!cleanToken) {
      throw new BadRequestException('Target FCM device token cannot be empty');
    }

    const timestamp = new Date().toISOString();
    const notificationTitle = title || 'Seedha Properties Test Alert 🔔';
    const notificationBody =
      body || 'This is a test notification verifying live Firebase Admin SDK delivery.';

    if (!this.isConfigured || !this.firebaseApp) {
      this.logger.log(
        `[FCM SIMULATION TEST] To token: ${cleanToken.slice(0, 10)}... Title: "${notificationTitle}" Body: "${notificationBody}"`,
      );
      return {
        success: true,
        messageId: `simulated_msg_${Date.now()}`,
        message: 'Notification simulated (Firebase credentials not in live mode)',
        timestamp,
      };
    }

    const sanitizedData: Record<string, string> = {};
    if (data) {
      for (const [key, val] of Object.entries(data)) {
        sanitizedData[key] = String(val);
      }
    }

    const message: Message = {
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
    } catch (err: any) {
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

  /**
   * Registers or updates an FCM device token for an authenticated user.
   * Supports multiple devices per user and ensures token uniqueness.
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: string = 'android',
  ): Promise<{ success: boolean; message: string; deviceTokenId: string }> {
    const cleanToken = token.trim();
    if (!cleanToken) {
      throw new BadRequestException('FCM device token cannot be empty');
    }

    // Verify user exists in database
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id '${userId}' not found`);
    }

    // Upsert token to avoid duplicate records while updating user association if device was re-assigned
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

    this.logger.log(
      `📲 Registered device token for user: ${user.email} (${userId}) [Platform: ${platform}]`,
    );

    return {
      success: true,
      message: 'FCM device token registered successfully',
      deviceTokenId: record.id,
    };
  }

  /**
   * Unregisters an FCM device token upon user logout.
   */
  async unregisterDeviceToken(
    userId: string,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
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
    } catch (err: any) {
      this.logger.warn(`Failed unregistering token for user ${userId}: ${err.message}`);
      return {
        success: false,
        message: 'Device token was not found or already removed',
      };
    }
  }

  /**
   * Sends a push notification to all active devices registered to a specific user.
   * Automatically detects and removes dead or invalid FCM tokens.
   */
  async sendToUser(
    userId: string,
    payload: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ): Promise<SendPushNotificationResult> {
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

  /**
   * Sends a push notification to multiple users simultaneously.
   */
  async sendToUsers(
    userIds: string[],
    payload: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ): Promise<SendPushNotificationResult> {
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

  /**
   * Internal helper that sends notifications to a list of tokens via FCM Multicast.
   * Cleans up expired/unregistered tokens automatically.
   */
  private async sendMulticastToTokens(
    tokens: string[],
    payload: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
    targetDescription: string,
  ): Promise<SendPushNotificationResult> {
    const totalDevices = tokens.length;

    // Simulation Mode fallback
    if (!this.isConfigured || !this.firebaseApp) {
      this.logger.log(
        `[FCM SIMULATION] Push notification to ${targetDescription} (${totalDevices} devices):
  Title: "${payload.title}"
  Body: "${payload.body}"
  Data: ${JSON.stringify(payload.data || {})}`,
      );
      return {
        success: true,
        totalDevices,
        sentCount: totalDevices,
        failureCount: 0,
        cleanedTokens: 0,
        message: 'Notification processed in simulation mode (credentials not configured)',
      };
    }

    // Live FCM Multicast Message Construction
    // Ensures clean string-only payload for data dictionary
    const sanitizedData: Record<string, string> = {};
    if (payload.data) {
      for (const [key, val] of Object.entries(payload.data)) {
        sanitizedData[key] = String(val);
      }
    }

    const message: MulticastMessage = {
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
      const response: BatchResponse = await messaging.sendEachForMulticast(message);
      const sentCount = response.successCount;
      const failureCount = response.failureCount;
      const deadTokens: string[] = [];

      response.responses.forEach((resp: SendResponse, idx: number) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          // Check for dead, uninstalled, or invalid tokens
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            deadTokens.push(tokens[idx]);
          } else {
            this.logger.warn(`FCM delivery error for device ${tokens[idx].slice(-8)}: ${resp.error.message}`);
          }
        }
      });

      // Automatically clean up dead tokens from PostgreSQL database
      let cleanedTokens = 0;
      if (deadTokens.length > 0) {
        const deleteResult = await this.prisma.deviceToken.deleteMany({
          where: { token: { in: deadTokens } },
        });
        cleanedTokens = deleteResult.count;
        this.logger.log(`🧹 Cleaned up ${cleanedTokens} expired/invalid FCM device tokens`);
      }

      this.logger.log(
        `📢 Push Notification Sent to ${targetDescription} - Success: ${sentCount}, Failed: ${failureCount}, Cleaned: ${cleanedTokens}`,
      );

      return {
        success: sentCount > 0 || failureCount === 0,
        totalDevices,
        sentCount,
        failureCount,
        cleanedTokens,
      };
    } catch (err: any) {
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

  /**
   * Returns all active device tokens for a user.
   */
  async getDeviceTokensForUser(userId: string) {
    return this.prisma.deviceToken.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
