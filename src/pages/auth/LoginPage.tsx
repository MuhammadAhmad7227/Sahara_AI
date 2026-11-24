import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { BrandLockup } from '@/components/common/BrandMark';
import { InlineNotice } from '@/components/common/States';
import { demoCredentials } from '@/services/api/auth';
import { loginSchema, fieldErrorsFrom } from '@/services/validation/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';

export default function LoginPage() {
  useDocumentTitle('Log in', 'Sign in to save drafts, track analyses and keep your preferences.');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ email, password, remember });
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await login({ email: parsed.data.email, password: parsed.data.password, remember });
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const useDemo = (role: 'citizen' | 'admin') => {
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
    setErrors({});
    setFormError(null);
  };

  return (
    <div className="container-page grid min-h-[calc(100dvh-9rem)] place-items-center py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <BrandLockup />
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">Log in to Sahara AI</h1>
          <p className="mt-1 text-sm text-ink-600">
            An account saves your drafts, analyses and language preferences. Browsing and the assistant work without
            one.
          </p>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink-800">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                className={cn(
                  'h-11 w-full rounded-lg border px-3 text-sm',
                  errors.email ? 'border-red-400' : 'border-ink-300',
                )}
                placeholder="name@example.com"
              />
              {errors.email && (
                <p id="login-email-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="login-password" className="block text-sm font-medium text-ink-800">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-brand-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  className={cn(
                    'h-11 w-full rounded-lg border px-3 pe-10 text-sm',
                    errors.password ? 'border-red-400' : 'border-ink-300',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 end-0 grid w-10 place-items-center text-ink-500 hover:text-ink-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p id="login-password-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 accent-brand-800"
              />
              Keep me signed in on this device
            </label>

            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting} leadingIcon={<LogIn className="size-4" aria-hidden="true" />}>
              {submitting ? 'Signing in…' : 'Log in'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-600">
            No account?{' '}
            <Link to="/register" className="font-medium text-brand-800 hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-4">
          <InlineNotice tone="info" title="Demonstration accounts">
            <p>
              Authentication is mocked in this build so the citizen and admin areas can be demonstrated. No password
              is stored or sent anywhere.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => useDemo('citizen')}>
                Fill citizen demo
              </Button>
              <Button variant="outline" size="sm" onClick={() => useDemo('admin')}>
                Fill admin demo
              </Button>
            </div>
            <p className="mt-2 font-mono text-[0.6875rem] text-ink-600">
              citizen@sahara.demo / demo1234 · admin@sahara.demo / demo1234
            </p>
          </InlineNotice>
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-ink-500">
          <ShieldAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Sahara AI will never ask for your password, OTP or PIN by message or phone call.
        </p>
      </div>
    </div>
  );
}
