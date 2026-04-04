'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '@/lib/authUtils';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialise synchronously from localStorage — no flicker, no API call on mount
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const current = authService.getCurrentUser();
      if (!current) { setUser(null); return; }
      // Silently validate token in background; on failure clear session
      const valid = await authService.checkTokenValidity();
      if (!valid) {
        setUser(null);
      } else {
        setUser(current);
      }
    } catch {
      setUser(authService.getCurrentUser());
    } finally {
      setIsLoading(false);
    }
  };

  // Validate token once in background after mount — does NOT block render
  useEffect(() => {
    if (authService.isAuthenticated()) {
      refreshSession();
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password, (path) => router.push(path));
    if (result.success && result.data?.token) {
      setUser(result.data);
    }
    return result;
  };

  const register = async (userData: any) => {
    const result = await authService.register(userData, (path) => router.push(path));
    if (result.success && result.data?.token) {
      setUser(result.data);
    }
    return result;
  };

  const logout = () => {
    authService.logout((path) => router.push(path));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
