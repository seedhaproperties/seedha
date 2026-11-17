import { Platform } from 'react-native';

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
  '557082409167-jb1ni7kc4e2eua2l93sshfn0hvk8m5r4.apps.googleusercontent.com';

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

let isConfigured = false;

function getNitroGoogleSignIn(): any {
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
  if (isConfigured || Platform.OS === 'web') return;
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
        if (google.accounts.oauth2?.initTokenClient) {
          try {
            const tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: webClientId,
              scope: 'openid profile email',
              prompt: 'select_account',
              callback: (tokenResponse: any) => {
                if (tokenResponse?.error) {
                  if (tokenResponse.error === 'access_denied') {
                    resolve({ success: false, canceled: true });
                  } else {
                    resolve({
                      success: false,
                      error: tokenResponse.error_description || tokenResponse.error,
                    });
                  }
                  return;
                }
                if (tokenResponse?.access_token) {
                  resolve({
                    success: true,
                    accessToken: tokenResponse.access_token,
                  });
                  return;
                }
                resolve({ success: false, error: 'No access token received from Google' });
              },
              error_callback: (err: any) => {
                if (err?.type === 'popup_closed') {
                  resolve({ success: false, canceled: true });
                } else {
                  resolve({
                    success: false,
                    error: err?.message || 'Google Sign-In window was closed',
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
          google.accounts.id.initialize({
            client_id: webClientId,
            callback: (res: any) => {
              if (res?.credential) {
                resolve({ success: true, idToken: res.credential });
              } else {
                resolve({ success: false, error: 'Google did not return credentials' });
              }
            },
          });
          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              resolve({
                success: false,
                error: 'Google Sign-In prompt was skipped or blocked by the browser. Please use Mobile OTP.',
              });
            }
          });
          return;
        }

        resolve({ success: false, error: 'Google authentication service is unavailable' });
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
