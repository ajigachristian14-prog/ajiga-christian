import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SupplierProfile, Notification } from '../types/index.js';
import { api, setStoredToken, getStoredToken } from '../services/api.js';

interface PlatformConfig {
  platformName: string;
  tagline: string;
  currency: string;
  supportedCities: string[];
  commissionPercent: number;
  directBankTransfer: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  hasAiKey: boolean;
}

interface AuthContextType {
  user: User | null;
  supplierProfile: SupplierProfile | null;
  config: PlatformConfig | null;
  isLoading: boolean;
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  quickLogin: (roleKey: 'admin' | 'buyer' | 'supplier-apparel' | 'supplier-furniture' | 'supplier-industrial' | 'supplier-tech') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchConfig = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load platform config', err);
    }
  };

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setSupplierProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      setSupplierProfile(data.supplierProfile || null);
      await refreshNotifications();
    } catch {
      setStoredToken(null);
      setUser(null);
      setSupplierProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (!getStoredToken()) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchConfig();
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.token);
      setUser(res.user);
      setSupplierProfile(res.supplierProfile || null);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setStoredToken(res.token);
      setUser(res.user);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (roleKey: 'admin' | 'buyer' | 'supplier-apparel' | 'supplier-furniture' | 'supplier-industrial' | 'supplier-tech') => {
    setIsLoading(true);
    try {
      const res = await api.quickLogin(roleKey);
      setStoredToken(res.token);
      setUser(res.user);
      setSupplierProfile(res.supplierProfile || null);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    setSupplierProfile(null);
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        supplierProfile,
        config,
        isLoading,
        notifications,
        unreadCount,
        login,
        register,
        quickLogin,
        logout,
        refreshUser,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
