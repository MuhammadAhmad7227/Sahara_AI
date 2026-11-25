import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { BrandLockup } from '@/components/common/BrandMark';
import { InlineNotice } from '@/components/common/States';
import { demoCredentials } from '@/services/api/auth';
import { loginSchema, fieldErrorsFrom, isValidationKey } from '@/services/validation/schemas';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';

export default function LoginPage() {
  const { t } = useLanguage();
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
    <div className="relative min-h-[calc(100dvh-9rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 surface-page" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 grid-lines opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,black,transparent_72%)]"
        aria-hidden="true"
      />

      <div className="container-page relative grid place-items-center py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <BrandLockup />
        </div>

        <div className="panel-float p-6 sm:p-7">
          <p className="mb-1.5 flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-700">
            <span className="h-px w-4 bg-accent-500" aria-hidden="true" />
            {t('auth.citizenAccount')}
          </p>
          <h1 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-ink-950">{t('auth.loginTitle')}</h1>
          <p className="mt-1 text-sm text-ink-600">{t('auth.loginSubtitle')}</p>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink-800">
                {t('auth.email')}
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
                  {isValidationKey(errors.email) ? t(errors.email) : errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="login-password" className="block text-sm font-medium text-ink-800">
                  {t('auth.password')}
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-brand-800 hover:underline">
                  {t('auth.forgot')}
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
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p id="login-password-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {isValidationKey(errors.password) ? t(errors.password) : errors.password}
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
              {t('auth.keepSignedIn')}
            </label>

            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting} leadingIcon={<LogIn className="size-4" aria-hidden="true" />}>
              {submitting ? t('auth.signingIn') : t('auth.login')}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-brand-800 hover:underline">
              {t('auth.createOne')}
            </Link>
          </p>
        </div>

        <div className="mt-4">
          <InlineNotice tone="info" title={t('auth.demoAccounts')}>
            <p>{t('auth.demoBody')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => useDemo('citizen')}>
                {t('auth.fillCitizen')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => useDemo('admin')}>
                {t('auth.fillAdmin')}
              </Button>
            </div>
            <p className="mt-2 font-mono text-[0.6875rem] text-ink-600">
              citizen@sahara.demo / demo1234 · admin@sahara.demo / demo1234
            </p>
          </InlineNotice>
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-ink-500">
          <ShieldAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {t('auth.neverAsk')}
        </p>
      </div>
      </div>
    </div>
  );
}
