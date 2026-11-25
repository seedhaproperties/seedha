import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { api } from './api';

let messagingModule: any = null;

/**
 * Lazily and safely imports @react-native-firebase/messaging.
 * Prevents bundling failures on Web and gracefully falls back in non-native environments.
 */
function getMessaging() {
  if (Platform.OS === 'web') return null;
  if (messagingModule) return messagingModule;

  try {
    const messaging = require('@react-native-firebase/messaging').default;
    messagingModule = messaging;
    return messagingModule;
  } catch (err: any) {
    console.log('[FCM Service] Native @react-native-firebase/messaging not available in current environment:', err?.message);
    return null;
  }
}

export interface PushNotificationPayload {
  title?: string;
  body?: string;
  data?: {
    screen?: string;
    propertyId?: string;
    visitId?: string;
    txnId?: string;
    type?: string;
    [key: string]: any;
  };
}

class FCMService {
  private currentToken: string | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;
  private unsubscribeOnTokenRefresh: (() => void) | null = null;

  /**
   * Request push notification permission from the user.
   * Supports Android 13+ (POST_NOTIFICATIONS) and iOS APNs.
   */
  async requestUserPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[FCM Service] Push notifications require native mobile platform');
      return false;
    }

    const messaging = getMessaging();
    if (!messaging) return false;

    try {
      // Android 13+ (API 33+) explicit POST_NOTIFICATIONS runtime permission
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Enable Notifications',
            message: 'Seedha Properties needs notification permission to alert you about enquiries, property updates, and visit bookings.',
            buttonPositive: 'Allow',
            buttonNegative: 'Not Now',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[FCM Service] Android notification permission denied by user');
          return false;
        }
      }

      // Firebase Messaging permission request (iOS and standard Android)
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('[FCM Service] Permission status:', enabled ? 'AUTHORIZED' : 'DENIED');
      return enabled;
    } catch (err: any) {
      console.log('[FCM Service] Error requesting notification permission:', err?.message);
      return false;
    }
  }

  /**
   * Fetches the FCM device registration token and syncs it with PostgreSQL backend.
   */
  async registerDeviceToken(userId?: string): Promise<string | null> {
    const messaging = getMessaging();
    if (!messaging) return null;

    try {
      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) return null;

      // Register device with FCM to receive remote messages
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();
      if (!token) {
        console.log('[FCM Service] No FCM registration token returned');
        return null;
      }

      this.currentToken = token;
      console.log('[FCM Service] Device registration token acquired:', token.slice(0, 14) + '...');

      // Store in backend database via API
      try {
        const res = await api.notifications.registerDeviceToken(token, Platform.OS, userId);
        console.log('[FCM Service] Device token registered with backend:', res.message || 'OK');
      } catch (apiErr: any) {
        console.log('[FCM Service] Backend token registration notice:', apiErr?.message);
      }

      return token;
    } catch (err: any) {
      console.log('[FCM Service] Error getting FCM device token:', err?.message);
      return null;
    }
  }

  /**
   * Sets up all push notification event listeners:
   * 1. Foreground message handler
   * 2. Background tap navigation handler
   * 3. Terminated / Cold-start tap navigation handler
   * 4. Token refresh listener
   */
  setupNotificationListeners(
    navigationHandler: (screen: string, params?: any) => void,
    onForegroundBanner?: (notification: PushNotificationPayload) => void,
  ): () => void {
    const messaging = getMessaging();
    if (!messaging) return () => {};

    // 1. Foreground message handler
    this.unsubscribeOnMessage = messaging().onMessage(async (remoteMessage: any) => {
      console.log('[FCM Service] 📩 Foreground notification received:', remoteMessage);

      const title = remoteMessage.notification?.title || 'Seedha Properties';
      const body = remoteMessage.notification?.body || '';
      const data = remoteMessage.data || {};

      if (onForegroundBanner) {
        onForegroundBanner({ title, body, data });
      } else {
        Alert.alert(title, body, [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'View',
            onPress: () => {
              if (data?.screen) {
                navigationHandler(data.screen, data);
              }
            },
          },
        ]);
      }
    });

    // 2. Background state tap handler (App is in background, user taps system notification)
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
      (remoteMessage: any) => {
        console.log('[FCM Service] 📲 Notification opened from background:', remoteMessage);
        const data = remoteMessage?.data;
        if (data?.screen) {
          navigationHandler(data.screen, data);
        } else {
          navigationHandler('notifications', data);
        }
      },
    );

    // 3. Terminated / Quit state tap handler (App was completely closed, cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('[FCM Service] 🚀 App opened from terminated state via notification:', remoteMessage);
          const data = remoteMessage?.data;
          if (data?.screen) {
            // Small timeout to allow screen router / stack to mount
            setTimeout(() => {
              navigationHandler(data.screen, data);
            }, 800);
          }
        }
      })
      .catch((err: any) => {
        console.log('[FCM Service] Error checking initial notification:', err?.message);
      });

    // 4. Token refresh handler (e.g. app re-install, token rotation)
    this.unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (newToken: string) => {
      console.log('[FCM Service] 🔄 FCM device token refreshed:', newToken.slice(0, 14) + '...');
      this.currentToken = newToken;
      try {
        await api.notifications.registerDeviceToken(newToken, Platform.OS);
      } catch (err: any) {
        console.log('[FCM Service] Error updating refreshed token in backend:', err?.message);
      }
    });

    return () => {
      if (this.unsubscribeOnMessage) this.unsubscribeOnMessage();
      if (unsubscribeOnNotificationOpenedApp) unsubscribeOnNotificationOpenedApp();
      if (this.unsubscribeOnTokenRefresh) this.unsubscribeOnTokenRefresh();
    };
  }

  /**
   * Unregisters the current device token upon user logout.
   */
  async unregisterDeviceToken(): Promise<void> {
    if (!this.currentToken) return;

    try {
      await api.notifications.unregisterDeviceToken(this.currentToken);
      console.log('[FCM Service] Device token unregistered from backend');
    } catch (err: any) {
      console.log('[FCM Service] Unregister token notice:', err?.message);
    }
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export const fcmService = new FCMService();
export default fcmService;
