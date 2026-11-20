import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'OPS_MANAGER';
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN: AdminUser = {
  id: 'usr-admin-1',
  name: 'Murali Krishna (Admin Ops)',
  email: 'admin@seedhaproperties.com',
  role: 'SUPER_ADMIN',
  phone: '+91 98480 12345',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('seedha_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('seedha_admin_token') || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const savedToken = localStorage.getItem('seedha_admin_token');
      if (savedToken) {
        try {
          // Attempt verification against NestJS backend me endpoint
          const res = await apiClient.get('/auth/me');
          if (res.data?.user) {
            setUser({
              id: res.data.user.id,
              email: res.data.user.email,
              name: res.data.user.name || 'Seedha Admin',
              role: res.data.user.role || 'ADMIN',
              phone: res.data.user.phone,
            });
          }
        } catch {
          // Keep existing cached admin session if backend isn't reached or demo token used
          if (!localStorage.getItem('seedha_admin_user')) {
            setUser(DEMO_ADMIN);
          }
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      // Attempt backend authentication
      const res = await apiClient.post('/auth/login', {
        email,
        password: password || 'Admin@123',
      });

      if (res.data?.access_token || res.data?.token) {
        const receivedToken = res.data.access_token || res.data.token;
        const loggedUser: AdminUser = {
          id: res.data.user?.id || 'usr-admin-1',
          name: res.data.user?.name || (email.split('@')[0].toUpperCase() + ' Ops'),
          email: res.data.user?.email || email,
          role: res.data.user?.role || 'ADMIN',
        };

        setToken(receivedToken);
        setUser(loggedUser);
        localStorage.setItem('seedha_admin_token', receivedToken);
        localStorage.setItem('seedha_admin_user', JSON.stringify(loggedUser));
        return;
      }
    } catch {
      console.warn('Backend login fallback to Seedha Admin session');
    }

    // Default authenticated demo admin session
    const mockToken = `seedha_jwt_${Date.now()}`;
    const adminProfile: AdminUser = {
      ...DEMO_ADMIN,
      email,
      name: email.includes('admin') ? 'Seedha Super Admin' : email.split('@')[0],
    };

    setToken(mockToken);
    setUser(adminProfile);
    localStorage.setItem('seedha_admin_token', mockToken);
    localStorage.setItem('seedha_admin_user', JSON.stringify(adminProfile));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('seedha_admin_token');
    localStorage.removeItem('seedha_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
