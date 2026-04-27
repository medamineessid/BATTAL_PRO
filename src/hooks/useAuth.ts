import React, { useState, useCallback, createContext, useContext } from 'react';
import type { User, UserRole } from '@/types';
import { signOut, signIn, signUp } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (data: RegisterData) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  completeOnboarding: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (!stored) return null;
      const u = JSON.parse(stored);
      if (!u?.id || !u?.email || !u?.role) return null;
      // Never auto-restore demo accounts — they must log in manually
      if (u.id.startsWith('demo_')) return null;
      return {
        id: u.id,
        email: u.email,
        role: u.role as UserRole,
        firstName: u.first_name ?? '',
        lastName: u.last_name ?? '',
        createdAt: new Date(u.created_at ?? Date.now()),
        lastLogin: new Date(),
      };
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Demo accounts — always work without backend
      const demoAccounts: Record<string, { password: string; role: UserRole; firstName: string; lastName: string }> = {
        'alex@example.com':  { password: 'demo', role: 'jobseeker',     firstName: 'Alex',  lastName: 'Johnson' },
        'sarah@example.com': { password: 'demo', role: 'company_admin', firstName: 'Sarah', lastName: 'Smith'   },
      };
      const demo = demoAccounts[email];
      if (demo && demo.password === password) {
        const newUser = {
          id: `demo_${demo.role}`, email, role: demo.role,
          firstName: demo.firstName, lastName: demo.lastName,
          createdAt: new Date(), lastLogin: new Date(),
        };
        localStorage.setItem('auth_user', JSON.stringify({
          id: newUser.id, email: newUser.email, role: newUser.role,
          first_name: newUser.firstName, last_name: newUser.lastName,
          created_at: newUser.createdAt.toISOString(),
        }));
        setUser(newUser);
        setIsLoading(false);
        return { error: null };
      }

      // Try real backend
      try {
        const { data, error } = await signIn(email, password);
        if (data && !error) {
          const u = data as any;
          const newUser: User = {
            id: u.id,
            email: u.email,
            role: u.role as UserRole,
            firstName: u.firstName ?? u.first_name ?? '',
            lastName: u.lastName ?? u.last_name ?? '',
            createdAt: new Date(u.createdAt ?? u.created_at ?? Date.now()),
            lastLogin: new Date(),
          };
          setUser(newUser);
          setIsLoading(false);
          return { error: null };
        }
        // Only surface backend errors that aren't network/fetch failures
        if (error && !error.message.toLowerCase().includes('fetch')) {
          setIsLoading(false);
          return { error };
        }
      } catch { /* backend unreachable, fall through */ }

      setIsLoading(false);
      return { error: new Error('Invalid email or password') };
    } catch {
      setIsLoading(false);
      return { error: new Error('Login failed') };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    if (!data.email || !data.password || !data.firstName || !data.lastName)
      return { error: new Error('All fields are required') };
    if (data.password.length < 6)
      return { error: new Error('Password must be at least 6 characters') };

    // Try real backend first
    try {
      const { data: result, error } = await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
      });
      if (result && !error) {
        const newUser: User = {
          id: result.user.id,
          email: result.user.email,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        localStorage.setItem('auth_user', JSON.stringify({
          id: newUser.id, email: newUser.email, role: newUser.role,
          first_name: newUser.firstName, last_name: newUser.lastName,
          created_at: newUser.createdAt.toISOString(),
        }));
        setUser(newUser);
        setIsNewUser(true);
        return { error: null };
      }
      // Only surface backend errors that aren't network/fetch failures
      if (error && !error.message.toLowerCase().includes('fetch')) return { error };
    } catch { /* backend unreachable, fall through to local */ }

    // Local fallback
    const newUser: User = {
      id: `local_${Date.now()}`,
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    localStorage.setItem('auth_user', JSON.stringify({
      id: newUser.id, email: newUser.email, role: newUser.role,
      first_name: newUser.firstName, last_name: newUser.lastName,
      created_at: newUser.createdAt.toISOString(),
    }));
    setUser(newUser);
    setIsNewUser(true);
    return { error: null };
  }, []);

  const completeOnboarding = useCallback(() => setIsNewUser(false), []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (!stored) return;
      const u = JSON.parse(stored);
      if (!u?.id) return;
      setUser({
        id: u.id, email: u.email, role: u.role as UserRole,
        firstName: u.first_name ?? '', lastName: u.last_name ?? '',
        createdAt: new Date(u.created_at ?? Date.now()), lastLogin: new Date(),
      });
    } catch { /* ignore */ }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isNewUser,
    login,
    register,
    logout,
    refreshUser,
    switchRole,
    completeOnboarding,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
