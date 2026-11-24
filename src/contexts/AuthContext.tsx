/**
 * Authentication state + role-aware guards.
 *
 * This is a demonstration session (see services/api/auth.ts). It exists so that
 * citizen pages, admin pages and role-aware navigation can be shown working.
 * The backend will be the real authority; client guards are a UX convenience.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  currentSession,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
} from '@/services/api/auth';
import type { Language, LoginRequest, RegisterRequest, UserProfile } from '@/types/domain';

interface AuthContextValue {
  user: UserProfile | null;
  initializing: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (request: LoginRequest) => Promise<UserProfile>;
  register: (request: RegisterRequest) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (patch: { name?: string; preferredLanguage?: Language; district?: string | null }) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Restore a demo session if one is present and not expired.
    const session = currentSession();
    setUser(session?.user ?? null);
    setInitializing(false);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await apiLogin(request);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    const result = await apiRegister(request);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: { name?: string; preferredLanguage?: Language; district?: string | null }) => {
      const updated = await apiUpdateProfile(patch);
      setUser(updated);
      return updated;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, initializing, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
