/**
 * Authentication API (maps to /api/auth/login, /register, /logout, /me).
 *
 * SECURITY NOTE — this is a *frontend demonstration*.
 *  - No password is stored, hashed or transmitted anywhere in demo mode.
 *  - The session object created here exists only so that role-aware navigation,
 *    protected routes and the admin area can be demonstrated.
 *  - When the backend is connected, the real API sets an HttpOnly session
 *    cookie and this module returns the profile; client-side route guards are a
 *    UX convenience only, never the security boundary.
 */
import { mockRequest } from '@/services/api/client';
import { ApiError, type AuthResult, type LoginRequest, type Language, type RegisterRequest, type UserProfile } from '@/types/domain';

const SESSION_KEY = 'sahara.demo.session';

interface DemoAccount {
  email: string;
  password: string;
  profile: UserProfile;
}

const demoAccounts: DemoAccount[] = [
  {
    email: 'citizen@sahara.demo',
    password: 'demo1234',
    profile: {
      id: 'usr-demo-citizen',
      name: 'Citizen Demo',
      email: 'citizen@sahara.demo',
      role: 'citizen',
      preferredLanguage: 'en',
      district: 'Burewala',
      createdAt: '2026-10-01T09:00:00Z',
      sessionType: 'mock-demo',
    },
  },
  {
    email: 'admin@sahara.demo',
    password: 'demo1234',
    profile: {
      id: 'usr-demo-admin',
      name: 'Sajid Iqbal',
      email: 'admin@sahara.demo',
      role: 'admin',
      preferredLanguage: 'en',
      district: 'Multan',
      createdAt: '2026-09-01T09:00:00Z',
      sessionType: 'mock-demo',
    },
  },
];

function readSession(): AuthResult | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    // Storage can contain stale data from an older version, or invalid JSON
    // written by another script. Never let it crash the shared application shell.
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<AuthResult>;
    const profile = candidate.user;
    const expiresAt = typeof candidate.expiresAt === 'string' ? Date.parse(candidate.expiresAt) : NaN;
    if (
      !profile || typeof profile !== 'object' ||
      typeof profile.name !== 'string' || !profile.name.trim() ||
      typeof profile.id !== 'string' || typeof profile.email !== 'string' ||
      (profile.role !== 'citizen' && profile.role !== 'admin') ||
      typeof candidate.token !== 'string' ||
      !Number.isFinite(expiresAt) || expiresAt <= Date.now()
    ) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return candidate as AuthResult;
  } catch {
    return null;
  }
}

function writeSession(result: AuthResult | null): void {
  try {
    if (result) window.localStorage.setItem(SESSION_KEY, JSON.stringify(result));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

function createSession(profile: UserProfile, remember: boolean): AuthResult {
  // A demo session token is a random, non-secret identifier — it grants nothing.
  const token = `demo.${Math.random().toString(36).slice(2)}.${Date.now().toString(36)}`;
  const ttl = remember ? 7 * 24 * 3600_000 : 12 * 3600_000;
  return { user: profile, token, expiresAt: new Date(Date.now() + ttl).toISOString() };
}

export async function login(request: LoginRequest): Promise<AuthResult> {
  const result = await mockRequest(
    () => {
      const account = demoAccounts.find(
        (a) => a.email.toLowerCase() === request.email.trim().toLowerCase(),
      );
      if (!account || account.password !== request.password) {
        throw new ApiError(401, 'The email or password you entered is not correct.', 'invalid_credentials');
      }
      const session = createSession(account.profile, Boolean(request.remember));
      writeSession(session);
      return session;
    },
    { latency: 650, failureRate: 0.04 },
  );
  if (!result.ok) throw result.error;
  return result.data;
}

export async function register(request: RegisterRequest): Promise<AuthResult> {
  const result = await mockRequest(
    () => {
      const exists = demoAccounts.some(
        (a) => a.email.toLowerCase() === request.email.trim().toLowerCase(),
      );
      if (exists) {
        throw new ApiError(409, 'An account with this email already exists.', 'email_taken');
      }
      const profile: UserProfile = {
        id: `usr-demo-${Math.random().toString(36).slice(2, 8)}`,
        name: request.name.trim(),
        email: request.email.trim(),
        role: 'citizen',
        preferredLanguage: request.preferredLanguage,
        district: null,
        createdAt: new Date().toISOString(),
        sessionType: 'mock-demo',
      };
      const session = createSession(profile, false);
      writeSession(session);
      return session;
    },
    { latency: 800, failureRate: 0.04 },
  );
  if (!result.ok) throw result.error;
  return result.data;
}

export async function logout(): Promise<void> {
  writeSession(null);
}

export function currentSession(): AuthResult | null {
  return readSession();
}

export async function requestPasswordReset(email: string): Promise<void> {
  const result = await mockRequest(
    () => {
      // Deliberately identical response whether or not the account exists, so the
      // UI never discloses which emails are registered.
      void email;
    },
    { latency: 700 },
  );
  if (!result.ok) throw result.error;
}

export async function updateProfile(patch: { name?: string; preferredLanguage?: Language; district?: string | null }): Promise<UserProfile> {
  const result = await mockRequest(() => {
    const session = readSession();
    if (!session) throw new ApiError(401, 'Please log in to continue.', 'unauthorized');
    const updated: UserProfile = { ...session.user, ...patch };
    writeSession({ ...session, user: updated });
    return updated;
  });
  if (!result.ok) throw result.error;
  return result.data;
}

export const demoCredentials = {
  citizen: { email: 'citizen@sahara.demo', password: 'demo1234' },
  admin: { email: 'admin@sahara.demo', password: 'demo1234' },
};
