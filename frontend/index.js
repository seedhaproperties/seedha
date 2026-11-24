import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './src/App';

// Register background message handler for Firebase Cloud Messaging
if (Platform.OS !== 'web') {
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log(
        '[FCM Background Handler] Message handled in background/quit state:',
        remoteMessage?.notification?.title || remoteMessage?.data,
      );
    });
  } catch (err) {
    // Gracefully ignore when running in non-native or web context
  }
}

registerRootComponent(App);
