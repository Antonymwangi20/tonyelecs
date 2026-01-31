import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, onAuthStateChange, signOut as supabaseSignOut } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if localStorage has cached user (for development/fallback)
    const cachedUser = localStorage.getItem('vv-user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('vv-user');
      }
    }

    // Listen to auth state changes from Supabase
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        localStorage.setItem('vv-user', JSON.stringify(authUser));
      } else {
        localStorage.removeItem('vv-user');
      }
      setIsLoading(false);
    });

    setIsLoading(false);
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabaseSignOut();
      setUser(null);
      localStorage.removeItem('vv-user');
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
