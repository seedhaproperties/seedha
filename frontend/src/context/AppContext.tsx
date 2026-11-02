import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ScreenState } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';

export type UserRole = 'USER' | 'ADMIN' | 'STAFF' | 'FIELD_AGENT';

export type UserProfile = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  role?: UserRole;
};

interface AppContextType {
  stack: ScreenState[];
  activeTab: string;
  savedIds: Set<string>;
  notifications: number;
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  isAdmin: boolean;
  push: (screen: ScreenState) => void;
  pop: () => void;
  setTab: (tab: string) => void;
  toggleSaved: (id: string) => void;
  currentScreen: ScreenState;
  signIn: (user: UserProfile, token?: string) => void;
  signOut: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [stack, setStack] = useState<ScreenState[]>([{ name: 'splash' }]);
  const [activeTab, setActiveTab] = useState('explore');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['1', '3']));

  // Restore stored session on web mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedUser = window.localStorage.getItem('seedha_user');
        const storedToken = window.localStorage.getItem('seedha_auth_token');
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setTokenState(storedToken);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.warn('Failed restoring stored session', e);
      }
    }
  }, []);

  const push = useCallback((screen: ScreenState) => {
    setStack(s => [...s, screen]);
  }, []);

  const pop = useCallback(() => {
    setStack(s => s.length > 1 ? s.slice(0, -1) : s);
  }, []);

  const setTab = useCallback((tab: string) => {
    setActiveTab(tab);
    const tabScreens: Record<string, ScreenState> = {
      home: { name: 'home' },
      landing: { name: 'landing' },
      explore: { name: 'explore' },
      myProperty: { name: 'myProperty' },
      payments: { name: 'payments' },
      profile: { name: 'profile' },
    };
    if (tab === 'post') {
      setStack(s => [...s, { name: 'postProperty' }]);
    } else {
      setStack([tabScreens[tab] || { name: 'landing' }]);
    }
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const signIn = useCallback((userData: UserProfile, authToken?: string) => {
    const normalizedUser: UserProfile = {
      ...userData,
      id: userData.id || `usr_${Date.now()}`,
      role: userData.role || 'USER',
    };
    setUser(normalizedUser);
    setIsAuthenticated(true);
    if (authToken) {
      setTokenState(authToken);
      setAuthToken(authToken);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('seedha_user', JSON.stringify(normalizedUser));
        if (authToken) {
          window.localStorage.setItem('seedha_auth_token', authToken);
        }
      } catch {}
    }
    setStack([{ name: 'landing' }]);
    setActiveTab('explore');
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setTokenState(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('seedha_user');
        window.localStorage.removeItem('seedha_auth_token');
      } catch {}
    }
    setStack([{ name: 'onboarding' }]);
    setActiveTab('explore');
  }, []);

  const currentScreen = stack[stack.length - 1];
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AppContext.Provider value={{
      stack, activeTab, savedIds, notifications: 3,
      isAuthenticated, user, token, isAdmin,
      push, pop, setTab, toggleSaved, currentScreen,
      signIn, signOut,
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
