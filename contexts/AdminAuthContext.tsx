import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AdminRole = 'manager' | 'super-admin';

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'vv-admin-user';

function getEnv(key: string): string | undefined {
  return (import.meta as any).env?.[key];
}

function getConfiguredAdmins() {
  const superAdminEmail = getEnv('VITE_ADMIN_EMAIL')?.trim();
  const superAdminPassword = getEnv('VITE_ADMIN_PASSWORD')?.trim();
  const managerEmail = getEnv('VITE_MANAGER_EMAIL')?.trim();
  const managerPassword = getEnv('VITE_MANAGER_PASSWORD')?.trim();

  const admins: Array<{ email: string; password: string; role: AdminRole; name: string }> = [];
  if (superAdminEmail && superAdminPassword) {
    admins.push({ email: superAdminEmail.toLowerCase(), password: superAdminPassword, role: 'super-admin', name: 'Admin' });
  }
  if (managerEmail && managerPassword) {
    admins.push({ email: managerEmail.toLowerCase(), password: managerPassword, role: 'manager', name: 'Manager' });
  }
  return admins;
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        setAdmin(JSON.parse(cached));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const admins = getConfiguredAdmins();
    if (admins.length === 0) {
      return { success: false, error: 'Admin login is not configured. Set VITE_ADMIN_EMAIL/VITE_ADMIN_PASSWORD (and optionally manager creds) in your environment variables.' };
    }

    const match = admins.find(a => a.email === email.trim().toLowerCase() && a.password === password);
    if (!match) {
      return { success: false, error: 'Invalid admin credentials.' };
    }

    const adminUser: AdminUser = {
      email: match.email,
      name: match.name,
      role: match.role,
      createdAt: new Date().toISOString(),
    };

    setAdmin(adminUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
    return { success: true };
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AdminAuthContextType>(() => ({
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
  }), [admin, isLoading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};


