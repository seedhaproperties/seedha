import { Platform, TurboModuleRegistry } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  code?: string;
  codeVerifier?: string;
  redirectUri?: string;
  email?: string;
  name?: string;
  photoUrl?: string;
  canceled?: boolean;
  error?: string;
}

const DEFAULT_WEB_CLIENT_ID =
  '258337837438-lhqp7g0e4p650fvhb1tkrvr8uucile21.apps.googleusercontent.com';

/**
 * Returns the Web Client ID used for native and backend ID-token verification
 */
export function getGoogleWebClientId(): string {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    DEFAULT_WEB_CLIENT_ID
  );
}

/**
 * Safely determines if native Nitro TurboModules are available in the current runtime environment.
 * Standard Expo Go from Play Store does not contain compiled C++ Nitro TurboModules.
 */
export function isNitroAvailable(): boolean {
  if (Platform.OS === 'web') return false;

  // In Expo Go, native C++ TurboModules cannot be loaded
  try {
    if (
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants as any).appOwnership === 'expo'
    ) {
      return false;
    }
  } catch {
    // If checking constants throws, assume Expo Go
    return false;
  }

  try {
    if (typeof (globalThis as any).NitroModulesProxy !== 'undefined') {
      return true;
    }
    const module = TurboModuleRegistry?.get?.('NitroModules');
    return !!module;
  } catch {
    return false;
  }
}

let isConfigured = false;

function getNitroGoogleSignIn(): any {
  if (!isNitroAvailable()) {
    return null;
  }
  try {
    const pkg = require('react-native-nitro-google-signin');
    if (pkg && pkg.GoogleOneTapSignIn) {
      return pkg;
    }
    return null;
  } catch {
    return null;
  }
}

function ensureConfigured(): void {
  if (isConfigured || Platform.OS === 'web' || !isNitroAvailable()) return;
  try {
    const nitro = getNitroGoogleSignIn();
    if (!nitro || !nitro.GoogleOneTapSignIn) return;

    const webClientId = getGoogleWebClientId();
    nitro.GoogleOneTapSignIn.configure({
      webClientId,
      scopes: ['openid', 'profile', 'email'],
      autoSelectOnSignIn: false,
    });
    isConfigured = true;
  } catch (err: any) {
    console.warn('[GoogleAuth] Native Google Sign-In configuration notice:', err?.message || err);
  }
}

/**
 * Loads the official Google Identity Services (GIS) SDK script on Web.
 */
function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google?.accounts?.oauth2 || (window as any).google?.accounts?.id) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services SDK')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Initiates Native Google Sign-In (Android/iOS) or Google Identity Services (Web)
 */
export async function startGoogleSignIn(): Promise<GoogleAuthResult> {
  const webClientId = getGoogleWebClientId();

  if (!webClientId || webClientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    return {
      success: false,
      error: 'Google Sign-In is not configured yet. Please use Mobile Number OTP.',
    };
  }

  // ── Web Platform: Official Google Identity Services (GIS) ──
  if (Platform.OS === 'web') {
    try {
      await loadGsiScript();
      const google = (window as any).google;

      if (!google?.accounts) {
        throw new Error('Google Identity Services SDK could not be initialized');
      }

      return new Promise<GoogleAuthResult>((resolve) => {
        let hasResolved = false;
        const safeResolve = (res: GoogleAuthResult) => {
          if (!hasResolved) {
            hasResolved = true;
            resolve(res);
          }
        };

        // Setup ID token listener via Google Identity Services
        if (google.accounts.id) {
          try {
            google.accounts.id.initialize({
              client_id: webClientId,
              callback: (res: any) => {
                if (res?.credential) {
                  safeResolve({ success: true, idToken: res.credential });
                } else {
                  safeResolve({ success: false, error: 'Google did not return credentials' });
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });
          } catch (initIdErr) {
            console.warn('[GoogleAuth] GIS id.initialize notice:', initIdErr);
          }
        }

        if (google.accounts.oauth2?.initTokenClient) {
          try {
            const popupTimeout = setTimeout(() => {
              safeResolve({
                success: false,
                canceled: true,
                error: 'Google Sign-In popup closed or canceled. Please use Mobile OTP or Password.',
              });
            }, 45000);

            const tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: webClientId,
              scope: 'openid profile email',
              prompt: 'select_account',
              callback: (tokenResponse: any) => {
                clearTimeout(popupTimeout);
                if (tokenResponse?.error) {
                  if (tokenResponse.error === 'access_denied') {
                    safeResolve({ success: false, canceled: true });
                  } else {
                      safeResolve({
                        success: false,
                        error: tokenResponse.error_description || tokenResponse.error,
                    });
                  }
                  return;
                }
                if (tokenResponse?.access_token) {
                    safeResolve({
                      success: true,
                      accessToken: tokenResponse.access_token,
                  });
                  return;
                }
                safeResolve({ success: false, error: 'No access token received from Google' });
              },
              error_callback: (err: any) => {
                clearTimeout(popupTimeout);
                if (err?.type === 'popup_closed') {
                  safeResolve({
                    success: false,
                    canceled: true,
                    error:
                      typeof window !== 'undefined'
                        ? `Google Sign-In closed. If you saw "Error 400: origin_mismatch", add "${window.location.origin}" to Authorized JavaScript Origins in Google Cloud Console, or log in with Mobile/Email OTP below.`
                        : 'Google Sign-In was closed. Please try Mobile or Email OTP.',
                  });
                } else {
                  safeResolve({
                    success: false,
                    error:
                      err?.message ||
                      'Google Sign-In window encountered an error. Please try Mobile OTP or Password.',
                  });
                }
              },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (initErr: any) {
      console.warn('[GoogleAuth] Web GIS initTokenClient error:', initErr.message);
    }
  }

  if (google.accounts.id) {
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          safeResolve({
            success: false,
            error: 'Google Sign-In prompt was skipped or blocked by the browser. Please use Mobile OTP or Password.',
          });
        }
            });
    return;
  }

  safeResolve({ success: false, error: 'Google authentication service is unavailable' });
});
      } catch (err: any) {
  console.warn('[GoogleAuth] Web GIS Error:', err.message);
  return {
    success: false,
    error: err.message || 'Failed to start Google Sign-In on Web',
  };
}
    }

// ── Native Mobile Platform (Android / iOS): Native Google Sign-In ──
const nitro = getNitroGoogleSignIn();
if (!nitro || !nitro.GoogleOneTapSignIn) {
  return {
    success: false,
    error:
      'Google One Tap sign-in requires an Android Development APK. In Expo Go, please sign in with your mobile number (use test OTP 123456).',
  };
}

try {
  const {
    GoogleOneTapSignIn,
    isSuccessResponse,
    isCancelledResponse,
  } = nitro;

  ensureConfigured();

  // Check Google Play Services availability on Android
  if (Platform.OS === 'android') {
    try {
      await GoogleOneTapSignIn.checkPlayServices(true);
    } catch (psErr: any) {
      console.warn('[GoogleAuth] Play Services check warning:', psErr.message);
    }
  }

  // Launch native account selection UI
  const response = await GoogleOneTapSignIn.presentExplicitSignIn();

  if (isCancelledResponse(response)) {
    return { success: false, canceled: true };
  }

  if (isSuccessResponse(response) && response.data?.idToken) {
    return {
      success: true,
      idToken: response.data.idToken,
      email: response.data.user?.email || undefined,
      name: response.data.user?.name || undefined,
      photoUrl: response.data.user?.photo || undefined,
    };
  }

  // Fallback: attempt getTokens() if idToken is stored on session
  try {
    const tokens = await GoogleOneTapSignIn.getTokens();
    if (tokens?.idToken) {
      return {
        success: true,
        idToken: tokens.idToken,
        accessToken: tokens.accessToken || undefined,
      };
    }
  } catch {
    // Ignore fallback error
  }

  return {
    success: false,
    error: 'Google Sign-In was not completed. Please try again or use Mobile OTP.',
  };
} catch (err: any) {
  console.warn('[GoogleAuth] Native Google Sign-In error:', err.message);

  return {
    success: false,
    error: err.message || 'Failed to initialize Native Google Sign-In prompt',
  };
}
}

/**
 * Safely signs out the native Google Sign-In session if available.
 * Disables auto-select on web and clears Google Play Services credential cache on Android.
 */
export async function signOutGoogle(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      const google = (window as any).google;
      if (google?.accounts?.id?.disableAutoSelect) {
        google.accounts.id.disableAutoSelect();
      }
    } catch {}
    return;
  }

  const nitro = getNitroGoogleSignIn();
  if (nitro?.GoogleOneTapSignIn?.signOut) {
    try {
      await nitro.GoogleOneTapSignIn.signOut();
      console.log('[GoogleAuth] Native Google session signed out successfully');
    } catch (err: any) {
      console.warn('[GoogleAuth] Native Google signOut notice:', err?.message || err);
    }
  }
}
