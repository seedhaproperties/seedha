import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ScreenState, AdminItem, AdminCategory, AuthUser, UserRole } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';
import { fcmService } from '../services/fcmService';
import { signOutGoogle } from '../services/googleAuth';
import { authenticateCredentials, authorizeAdmin } from '../services/authService';

export type { UserRole };

export type UserProfile = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  role?: UserRole;
  avatarUrl?: string | null;
  dob?: string | null;
  gender?: string | null;
  userRole?: string | null;
  streetAddress?: string | null;
  state?: string | null;
  pincode?: string | null;
  alternatePhone?: string | null;
  alternateEmail?: string | null;
  summary?: {
    savedCount?: number;
    activityCount?: number;
    propertiesCount?: number;
    servicesCount?: number;
  };
  settings?: {
    whatsappUpdates?: boolean;
    pushNotifications?: boolean;
    emailUpdates?: boolean;
    smsAlerts?: boolean;
    offersPromotions?: boolean;
    visitReminders?: boolean;
    useLocation?: boolean;
  };
};

export interface FlatmatesFilterOptions {
  gender: 'All' | 'Male' | 'Female' | 'Anyone';
  budgetMax: number;
  locations: string[];
  bhk: string[];
  propertyType: string[];
  furnishing: string[];
  parking: string | null;
}

export interface FilterOptions {
  bhk: string[];
  propertyType: string[];
  furnishing: string[];
  parking: string | null;
  verifiedOnly: boolean;
  budgetMax?: number;
  locations?: string[];
}

const defaultAdminRequests: AdminItem[] = [];

export type PendingAction = {
  action?: () => void;
  targetScreen?: ScreenState;
  sourceScreen?: ScreenState;
  actionName?: string;
};

interface AppContextType {
  stack: ScreenState[];
  activeTab: string;
  savedIds: Set<string>;
  notifications: number;
  isAuthenticated: boolean;
  isGuest: boolean;
  authLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  authToken: string | null;
  isAdmin: boolean;
  pendingAction: PendingAction | null;
  requireAuth: (action?: () => void, targetScreen?: ScreenState, actionName?: string) => boolean;
  completeAuth: (verifiedUser: UserProfile, token?: string) => void;
  cancelAuth: () => void;
  push: (screen: ScreenState) => void;
  pop: () => void;
  setTab: (tab: string) => void;
  toggleSaved: (id: string) => void;
  currentScreen: ScreenState;
  signIn: (user: Partial<UserProfile> | Partial<AuthUser>, token?: string) => void;
  signOut: () => void;
  login: (email: string, pass: string, requestedRole?: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  activeFilters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  flatmatesFilters: FlatmatesFilterOptions;
  setFlatmatesFilters: (filters: FlatmatesFilterOptions) => void;
  adminRequests: AdminItem[];
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;
  addAdminRequest: (req: Omit<AdminItem, 'id' | 'date' | 'status' | 'stage'>) => void;
  updateAdminRequest: (id: string, updates: Partial<AdminItem>) => void;
  loadAdminRequests: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  refreshUserProfile: () => Promise<UserProfile | null>;
}

const AppContext = createContext<AppContextType | null>(null);

function isJwtExpired(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true; // Malformed / non-JWT tokens are invalid
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed || !parsed.exp || typeof parsed.exp !== 'number') {
      return true;
    }
    // Buffer with 5 seconds margin
    return Date.now() >= (parsed.exp * 1000 - 5000);
  } catch {
    return true;
  }
}

// Development toggle: set to false to enforce real database & OTP authentication for all action flows
export const BYPASS_AUTH_FOR_DEV = false;

const HELD_AUTH_SCREENS = new Set(['mobileLogin', 'login', 'signup', 'otp', 'onboarding']);

const DEV_MOCK_USER: UserProfile = {
  id: 'usr_1794812268930',
  name: 'Rahul Google User',
  phone: '+91 98490 63269',
  email: 'rahul.google.test@gmail.com',
  city: 'Hyderabad',
  role: 'USER',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format',
  dob: '1990-05-15',
  gender: 'Male',
  userRole: 'Owner',
  streetAddress: 'Plot 42, Road No. 36, Jubilee Hills',
  state: 'Telangana',
  pincode: '500033',
  alternatePhone: null,
  alternateEmail: null,
  summary: {
    savedCount: 3,
    activityCount: 14,
    propertiesCount: 5,
    servicesCount: 4,
  },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(BYPASS_AUTH_FOR_DEV);
  const [user, setUser] = useState<UserProfile | null>(BYPASS_AUTH_FOR_DEV ? DEV_MOCK_USER : null);
  const [token, setTokenState] = useState<string | null>(
    getAuthToken() || (BYPASS_AUTH_FOR_DEV ? 'dev-bypass-token' : null)
  );
  // Launch flow: go directly to Home when auth is on hold, otherwise start with Splash -> Landing
  const [stack, setStack] = useState<ScreenState[]>([
    { name: BYPASS_AUTH_FOR_DEV ? 'home' : 'splash' },
  ]);
  const [activeTab, setActiveTab] = useState(BYPASS_AUTH_FOR_DEV ? 'home' : 'landing');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['1', '3']));
  const [adminRequests, setAdminRequests] = useState<AdminItem[]>(defaultAdminRequests);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    bhk: [],
    propertyType: [],
    furnishing: [],
    parking: null,
    verifiedOnly: false,
  });
  const [flatmatesFilters, setFlatmatesFiltersState] = useState<FlatmatesFilterOptions>({
    gender: 'All',
    budgetMax: 100000,
    locations: [],
    bhk: [],
    propertyType: [],
    furnishing: [],
    parking: null,
  });

  const effectiveUser = BYPASS_AUTH_FOR_DEV ? (user || DEV_MOCK_USER) : user;
  const effectiveIsAuthenticated = BYPASS_AUTH_FOR_DEV ? true : isAuthenticated;
  const isGuest = !effectiveIsAuthenticated || !effectiveUser;

  // Enforce logged-in state & strip any held auth screens immediately (even across Fast Refresh)
  useEffect(() => {
    if (!BYPASS_AUTH_FOR_DEV) return;
    if (!isAuthenticated) setIsAuthenticated(true);
    if (!user) setUser(DEV_MOCK_USER);
    setStack(s => {
      const hasHeld = s.some(sc => HELD_AUTH_SCREENS.has(sc.name) || sc.name === 'splash');
      if (!hasHeld) return s;
      const cleaned = s.filter(sc => !HELD_AUTH_SCREENS.has(sc.name) && sc.name !== 'splash');
      return cleaned.length > 0 ? cleaned : [{ name: 'home' }];
    });
    if (activeTab === 'landing') setActiveTab('home');
  }, [isAuthenticated, user, activeTab]);

  const setFilters = useCallback((filters: FilterOptions) => {
    setActiveFilters(filters);
  }, []);

  const setFlatmatesFilters = useCallback((filters: FlatmatesFilterOptions) => {
    setFlatmatesFiltersState(filters);
  }, []);

  // Restore and verify stored session on mount against real database API (/auth/me)
  useEffect(() => {
    let isMounted = true;
    const verifyStoredSession = async () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const storedToken = window.localStorage.getItem('seedha_auth_token');
          const storedUser = window.localStorage.getItem('seedha_user');
          if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
            if (isJwtExpired(storedToken)) {
              // Expired token: clear immediately without unnecessary network call
              try {
                window.localStorage.removeItem('seedha_auth_token');
                window.localStorage.removeItem('seedha_user');
              } catch { }
            } else {
              setAuthToken(storedToken);
              setTokenState(storedToken);
              try {
                const res = await api.auth.me();
                if (res && (res.id || res.sub) && isMounted) {
                  const verifiedUser: UserProfile = {
                    id: res.id || res.sub,
                    name: res.name || (storedUser ? JSON.parse(storedUser).name : ''),
                    email: res.email || '',
                    phone: res.phone || (storedUser ? JSON.parse(storedUser).phone : ''),
                    city: res.city || '',
                    role: res.role || 'USER',
                    avatarUrl: res.avatarUrl || (storedUser ? JSON.parse(storedUser).avatarUrl : undefined),
                    dob: res.dob || (storedUser ? JSON.parse(storedUser).dob : undefined),
                    gender: res.gender || (storedUser ? JSON.parse(storedUser).gender : undefined),
                    userRole: res.userRole || (storedUser ? JSON.parse(storedUser).userRole : undefined),
                    streetAddress: res.streetAddress || (storedUser ? JSON.parse(storedUser).streetAddress : undefined),
                    state: res.state || (storedUser ? JSON.parse(storedUser).state : undefined),
                    pincode: res.pincode || (storedUser ? JSON.parse(storedUser).pincode : undefined),
                    alternatePhone: res.alternatePhone || null,
                    alternateEmail: res.alternateEmail || null,
                    summary: {
                      savedCount: res.summary?.savedCount || 3,
                      activityCount: res.summary?.activityCount || 14,
                      propertiesCount: res.summary?.propertiesCount || 5,
                      servicesCount: res.summary?.servicesCount || 4,
                    },
                    settings: res.settings || (storedUser ? JSON.parse(storedUser).settings : undefined),
                  };
                  setUser(verifiedUser);
                  setIsAuthenticated(true);
                  return;
                }
              } catch (authErr) {
                // Token invalidated or revoked in database
              }
            }
          }
        } catch (e) {
          console.warn('[AppContext] Failed restoring session:', e);
        }

        // Stored session is missing or invalid in database -> remain clean guest
        if (isMounted) {
          setUser(null);
          setTokenState(null);
          setAuthToken(null);
          setIsAuthenticated(false);
          try {
            window.localStorage.removeItem('seedha_user');
            window.localStorage.removeItem('seedha_auth_token');
          } catch { }
        }
      }
    };

    verifyStoredSession();
    // Load persisted saved properties from Supabase
    api.properties.getMySaved().then((savedList) => {
      if (Array.isArray(savedList) && savedList.length > 0) {
        setSavedIds(new Set(savedList.map((p: any) => p.id)));
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const push = useCallback((screen: ScreenState) => {
    if (BYPASS_AUTH_FOR_DEV && HELD_AUTH_SCREENS.has(screen.name)) {
      return;
    }
    setStack(s => [...s, screen]);
  }, []);

  const pop = useCallback(() => {
    setStack(s => (s.length > 1 ? s.slice(0, -1) : [{ name: 'home' }]));
  }, []);

  // Centralized authentication guard for protected guest actions
  const requireAuth = useCallback(
    (action?: () => void, targetScreen?: ScreenState, actionName?: string): boolean => {
      if (BYPASS_AUTH_FOR_DEV || (isAuthenticated && user)) {
        if (action) action();
        if (targetScreen) setStack(s => [...s, targetScreen]);
        return true;
      }

      // Guest trying protected action -> queue pending action and show Mobile Login
      setStack(s => {
        const current = s[s.length - 1] || { name: 'home' };
        setPendingAction({
          action,
          targetScreen,
          sourceScreen: current,
          actionName,
        });
        return [...s, { name: 'mobileLogin', params: { returnScreen: current.name, actionName } }];
      });
      return false;
    },
    [isAuthenticated, user]
  );

  const cancelAuth = useCallback(() => {
    setPendingAction(null);
    setStack(s => {
      const filtered = s.filter(screen => screen.name !== 'mobileLogin' && screen.name !== 'login' && screen.name !== 'otp');
      return filtered.length > 0 ? filtered : [{ name: 'home' }];
    });
  }, []);

  const completeAuth = useCallback(
    (verifiedUser: UserProfile, authToken?: string) => {
      setUser(verifiedUser);
      setIsAuthenticated(true);
      if (authToken) {
        setTokenState(authToken);
        setAuthToken(authToken);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('seedha_user', JSON.stringify(verifiedUser));
          if (authToken) {
            window.localStorage.setItem('seedha_auth_token', authToken);
          }
        } catch { }
      }

      // Resume requested action or destination without resetting to home
      if (pendingAction) {
        const { action, targetScreen } = pendingAction;
        setPendingAction(null);
        setStack(s => {
          const withoutLogin = s.filter(screen => screen.name !== 'mobileLogin' && screen.name !== 'login' && screen.name !== 'otp');
          if (targetScreen) {
            return [...withoutLogin, targetScreen];
          }
          return withoutLogin.length > 0 ? withoutLogin : [{ name: 'home' }];
        });
        if (action) {
          setTimeout(() => {
            try {
              action();
            } catch (e) {
              console.warn('Error executing pending action after auth:', e);
            }
          }, 100);
        }
      } else {
        setStack(s => {
          const withoutLogin = s.filter(screen => screen.name !== 'mobileLogin' && screen.name !== 'login' && screen.name !== 'otp');
          return withoutLogin.length > 0 ? withoutLogin : [{ name: 'home' }];
        });
      }
    },
    [pendingAction]
  );

  const setTab = useCallback((tab: string) => {
    if (tab === 'post') {
      requireAuth(undefined, { name: 'postProperty' }, 'Post Property');
      return;
    }
    setActiveTab(tab);
    const tabScreens: Record<string, ScreenState> = {
      home: { name: 'home' },
      landing: { name: 'landing' },
      explore: { name: 'explore' },
      search: { name: 'search' },
      saved: { name: 'explore', params: { filter: 'saved' } },
      myProperty: { name: 'myProperty' },
      payments: { name: 'payments' },
      profile: { name: 'profile' },
    };
    setStack([tabScreens[tab] || { name: 'home' }]);
  }, [requireAuth]);

  const toggleSaved = useCallback(
    (id: string) => {
      if (!effectiveIsAuthenticated) {
        requireAuth(
          () => {
            setSavedIds(s => {
              const next = new Set(s);
              next.has(id) ? next.delete(id) : next.add(id);
              return next;
            });
            api.properties.toggleSave(id).catch(err => {
              console.warn('[AppContext] Failed to persist toggleSave to database:', err);
            });
          },
          undefined,
          'Save Property'
        );
        return;
      }
      setSavedIds(s => {
        const next = new Set(s);
        next.has(id) ? next.delete(id) : next.add(id);
        const newCount = next.size;
        setUser(prev => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            summary: {
              ...(prev.summary || {}),
              savedCount: newCount,
            },
          };
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              window.localStorage.setItem('seedha_user', JSON.stringify(updated));
            } catch {}
          }
          return updated;
        });
        return next;
      });
      api.properties.toggleSave(id).catch(err => {
        console.warn('[AppContext] Failed to persist toggleSave to database:', err);
      });
    },
    [effectiveIsAuthenticated, requireAuth]
  );

  const signIn = useCallback(
    (userData: Partial<UserProfile> | Partial<AuthUser>, authToken?: string) => {
      const normalizedUser: UserProfile = {
        id: userData.id || `usr_${Date.now()}`,
        name: userData.name || '',
        phone: userData.phone || '',
        email: userData.email || '',
        city: userData.city || '',
        role: (userData.role as UserRole) || 'USER',
      };
      completeAuth(normalizedUser, authToken);
    },
    [completeAuth]
  );

  const login = useCallback(
    async (identifier: string, pass: string, requestedRole?: UserRole) => {
      try {
        const res = await api.auth.login(identifier, pass);
        if (res?.user && (res.accessToken || res.token)) {
          completeAuth(res.user, res.accessToken || res.token);
          return { success: true, role: res.user.role };
        }
        return { success: false, error: 'Invalid response from database server' };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Invalid credentials. Please verify your registered email/phone and password.',
        };
      }
    },
    [completeAuth]
  );

  const signOut = useCallback(() => {
    fcmService.unregisterDeviceToken().catch(() => {});
    signOutGoogle().catch(() => {});
    setUser(null);
    setTokenState(null);
    setIsAuthenticated(false);
    setPendingAction(null);
    setAuthToken(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('seedha_user');
        window.localStorage.removeItem('seedha_auth_token');
      } catch { }
    }
    // Stay gracefully in Guest mode on Home screen
    setStack([{ name: 'home' }]);
    setActiveTab('home');
  }, []);

  const logoutAdmin = useCallback(() => {
    if (user?.role === 'ADMIN') {
      signOut();
    } else {
      setTab('home');
    }
  }, [user, signOut, setTab]);

  const loginAdmin = useCallback((passcode: string) => {
    if (passcode.trim() === 'admin123' || passcode.trim() === 'seedha2026' || passcode.trim() === 'admin') {
      setUser(prev => ({
        id: prev?.id || 'admin_1',
        name: prev?.name || 'Administrator',
        phone: prev?.phone || '+91 98480 11223',
        email: prev?.email || 'admin@seedhaproperties.com',
        city: 'Hyderabad',
        role: 'ADMIN',
      }));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const addAdminRequest = useCallback((req: Omit<AdminItem, 'id' | 'date' | 'status' | 'stage'>) => {
    const newItem: AdminItem = {
      ...req,
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      submittedBy: req.submittedBy || 'Rahul Sharma',
      phone: req.phone || '+91 98765 43210',
      subtitle: req.subtitle || req.location,
      city: req.city || 'Hyderabad',
      date: 'Just now',
      status: 'pending_review',
      stage: 0,
    };
    setAdminRequests(prev => [newItem, ...prev]);
  }, []);

  const updateAdminRequest = useCallback((id: string, updates: Partial<AdminItem>) => {
    setAdminRequests(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const loadAdminRequests = useCallback(async () => {
    try {
      const data = await api.admin.getAllRequests();
      if (Array.isArray(data)) {
        const mapped: AdminItem[] = data.map((r: any) => ({
          id: r.id,
          category: (r.module === 'rental_agreements' ? 'rental_agreement' : r.module) as AdminCategory,
          title: r.title,
          subtitle: r.subtitle,
          submittedBy: r.ownerOrUser?.name || 'Applicant',
          phone: r.ownerOrUser?.phone || '+91 98765 43210',
          date: r.relativeTime || 'Recent',
          location: r.locality || r.city || 'Hyderabad',
          city: r.city || 'Hyderabad',
          status: r.status,
          stage:
            r.status === 'published' || r.status === 'sent_to_user' || r.status === 'sent_digitally'
              ? 3
              : r.status === 'verified'
              ? 2
              : r.status === 'field_visit' || r.status === 'in_review'
              ? 1
              : 0,
          notes: r.fieldVisit?.notes || '',
          details: {
            price: r.priceDisplay,
            config: r.configLabel,
            area: r.areaSqFt ? `${r.areaSqFt} sq.ft` : undefined,
            ...(r.homeLoan || {}),
            ...(r.rentalAgreement || {}),
            ...(r.ownerBackground || {}),
          },
        }));
        setAdminRequests(mapped);
      }
    } catch (err: any) {
      console.warn('[AppContext] Failed to load admin requests from backend:', err?.message);
    }
  }, []);

  useEffect(() => {
    loadAdminRequests();
  }, [loadAdminRequests]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = { ...(prev || {}), ...updates } as UserProfile;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('seedha_user', JSON.stringify(updated));
        } catch { }
      }
      return updated;
    });
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res && (res.id || res.sub)) {
        const verifiedUser: UserProfile = {
          id: res.id || res.sub,
          name: res.name,
          email: res.email,
          phone: res.phone,
          city: res.city || 'Hyderabad',
          role: res.role || 'USER',
          avatarUrl: res.avatarUrl,
          dob: res.dob,
          gender: res.gender,
          userRole: res.userRole,
          streetAddress: res.streetAddress,
          state: res.state,
          pincode: res.pincode,
          alternatePhone: res.alternatePhone,
          alternateEmail: res.alternateEmail,
          summary: {
            savedCount: res.summary?.savedCount || 3,
            activityCount: res.summary?.activityCount || 14,
            propertiesCount: res.summary?.propertiesCount || 5,
            servicesCount: res.summary?.servicesCount || 4,
          },
          settings: res.settings,
        };
        setUser(verifiedUser);
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem('seedha_user', JSON.stringify(verifiedUser));
          } catch { }
        }
        return verifiedUser;
      }
    } catch (e) {
      console.warn('[AppContext] Failed refreshing user profile:', e);
    }
    return null;
  }, []);

  const currentScreen = stack[stack.length - 1];
  const isAdmin = effectiveUser?.role === 'ADMIN';

  return (
    <AppContext.Provider value={{
      stack, activeTab, savedIds, notifications: 3,
      isAuthenticated: effectiveIsAuthenticated, isGuest, authLoading, user: effectiveUser, token, authToken: token, isAdmin,
      pendingAction, requireAuth, completeAuth, cancelAuth,
      push, pop, setTab, toggleSaved, currentScreen,
      signIn, signOut, login,
      activeFilters, setFilters,
      flatmatesFilters, setFlatmatesFilters,
      adminRequests, loginAdmin, logoutAdmin, addAdminRequest, updateAdminRequest,
      loadAdminRequests,
      updateUserProfile, refreshUserProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
