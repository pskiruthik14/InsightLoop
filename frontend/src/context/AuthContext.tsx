import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, businessName: string, category?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: { business_name: string; category: string; size: string; sources: string[]; primary_goal: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('insightloop_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      setBusiness(data.business);
    } catch {
      localStorage.removeItem('insightloop_token');
      setUser(null);
      setBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('insightloop_token', res.token);
    setUser(res.user);
    setBusiness(res.business);
  };

  const register = async (email: string, password: string, fullName: string, businessName: string, category = 'Retail') => {
    const res = await api.register({
      email,
      password,
      full_name: fullName,
      business_name: businessName,
      business_category: category,
    });
    localStorage.setItem('insightloop_token', res.token);
    setUser(res.user);
    setBusiness(res.business);
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    localStorage.setItem('insightloop_token', res.token);
    setUser(res.user);
    setBusiness(res.business);
  };

  const logout = () => {
    localStorage.removeItem('insightloop_token');
    setUser(null);
    setBusiness(null);
  };

  const completeOnboarding = async (data: { business_name: string; category: string; size: string; sources: string[]; primary_goal: string }) => {
    await api.completeOnboarding(data);
    if (business) {
      setBusiness({ ...business, name: data.business_name, category: data.category, onboarding_completed: true });
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        completeOnboarding,
        refreshUser,
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
