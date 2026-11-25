import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { BrandLockup } from '@/components/common/BrandMark';
import { InlineNotice } from '@/components/common/States';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { requestPasswordReset } from '@/services/api/auth';
import { errorMessage } from '@/services/api/errors';
import { fieldErrorsFrom, forgotPasswordSchema, isValidationKey } from '@/services/validation/schemas';
import { cn } from '@/utils/cn';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  /** Field errors carry translation keys; render through t() safely. */
  const renderError = (message?: string) =>
    message ? (isValidationKey(message) ? t(message) : message) : null;
  useDocumentTitle('Reset your password', 'Request a password reset link for your Sahara AI account.');

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(fieldErrorsFrom(parsed.error).email);
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      await requestPasswordReset(parsed.data.email);
      setSent(true);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page grid min-h-[calc(100dvh-9rem)] place-items-center py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <BrandLockup />
        </div>

        <div className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-6 shadow-card">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true">
                <MailCheck className="size-5" />
              </span>
              <h1 className="mt-3 text-lg font-semibold text-ink-950">Check your email</h1>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                If an account exists for <strong>{email}</strong>, a reset link has been sent. For your security we do
                not confirm whether an address is registered.
              </p>
              <InlineNotice tone="info" className="mt-4 text-start" title="Demo build">
                <p>
                  Email delivery is not connected yet, so no message will arrive. This screen demonstrates the flow
                  the backend will complete.
                </p>
              </InlineNotice>
              <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-800 hover:underline">
                <ArrowLeft className="size-4 dir-arrow" aria-hidden="true" /> Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold tracking-tight text-ink-950">Reset your password</h1>
              <p className="mt-1 text-sm text-ink-600">
                Enter the email address you registered with and we will send a reset link.
              </p>

              <form onSubmit={submit} noValidate className="mt-5 space-y-4">
                <div>
                  <label htmlFor="fp-email" className="mb-1.5 block text-sm font-medium text-ink-800">
                    Email
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'fp-error' : undefined}
                    className={cn('h-11 w-full rounded-lg border px-3 text-sm', error ? 'border-red-400' : 'border-ink-300')}
                  />
                  {error && (
                    <p id="fp-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                      {renderError(error)}
                    </p>
                  )}
                </div>

                {formError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                    {formError}
                  </p>
                )}

                <Button type="submit" fullWidth loading={submitting}>
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>

              <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-800 hover:underline">
                <ArrowLeft className="size-4 dir-arrow" aria-hidden="true" /> Back to log in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
