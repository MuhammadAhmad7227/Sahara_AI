import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { BrandLockup } from '@/components/common/BrandMark';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { fieldErrorsFrom, registerSchema } from '@/services/validation/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';
import type { Language } from '@/types/domain';

export default function RegisterPage() {
  useDocumentTitle('Create an account', 'Create a Sahara AI account to save drafts, analyses and preferences.');

  const { register } = useAuth();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('en');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = (() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      preferredLanguage,
      acceptTerms,
    });
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await register({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
        preferredLanguage: parsed.data.preferredLanguage,
      });
      setLanguage(parsed.data.preferredLanguage);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page grid place-items-center py-8">
      <div className="w-full max-w-lg">
        <div className="mb-5 flex justify-center">
          <BrandLockup />
        </div>

        <div className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-6 shadow-card">
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">Create your account</h1>
          <p className="mt-1 text-sm text-ink-600">
            We collect only your name, email and language preference. No CNIC number is requested.
          </p>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-ink-800">
                Full name <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'reg-name-error' : undefined}
                className={cn('h-11 w-full rounded-lg border px-3 text-sm', errors.name ? 'border-red-400' : 'border-ink-300')}
              />
              {errors.name && (
                <p id="reg-name-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-ink-800">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'reg-email-error' : 'reg-email-help'}
                className={cn('h-11 w-full rounded-lg border px-3 text-sm', errors.email ? 'border-red-400' : 'border-ink-300')}
              />
              <p id="reg-email-help" className="mt-1 text-xs text-ink-500">
                Used only to sign in and to contact you about your account.
              </p>
              {errors.email && (
                <p id="reg-email-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-ink-800">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby="reg-password-help"
                    className={cn('h-11 w-full rounded-lg border px-3 pe-10 text-sm', errors.password ? 'border-red-400' : 'border-ink-300')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 end-0 grid w-10 place-items-center text-ink-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                  </button>
                </div>
                <div className="mt-1.5 flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        'h-1 flex-1 rounded-full',
                        password.length === 0
                          ? 'bg-ink-200'
                          : n <= strength
                            ? strength <= 2
                              ? 'bg-red-400'
                              : strength <= 3
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            : 'bg-ink-200',
                      )}
                    />
                  ))}
                </div>
                <p id="reg-password-help" className="mt-1 text-xs text-ink-500">
                  At least 8 characters, including a letter and a number.
                </p>
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-red-700" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-ink-800">
                  Confirm password <span className="text-red-600">*</span>
                </label>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  aria-describedby={errors.confirmPassword ? 'reg-confirm-error' : undefined}
                  className={cn('h-11 w-full rounded-lg border px-3 text-sm', errors.confirmPassword ? 'border-red-400' : 'border-ink-300')}
                />
                {errors.confirmPassword && (
                  <p id="reg-confirm-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <LanguageSelector
              label="Preferred language"
              value={preferredLanguage}
              onChange={(lang) => setPreferredLanguage(lang)}
            />

            <div>
              <label className="flex items-start gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  aria-invalid={errors.acceptTerms ? true : undefined}
                  className="mt-0.5 size-4 accent-brand-800"
                />
                <span>
                  I understand that Sahara AI provides information from reviewed public sources and does not replace
                  government offices, lawyers or programme authorities.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting} leadingIcon={<UserPlus className="size-4" aria-hidden="true" />}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-600">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-brand-800 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
