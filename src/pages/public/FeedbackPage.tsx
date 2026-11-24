import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { InlineNotice } from '@/components/common/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAsync } from '@/hooks/useAsync';
import { listServices } from '@/services/api/services';
import { mockRequest } from '@/services/api/client';
import { errorMessage } from '@/services/api/errors';
import { feedbackSchema, fieldErrorsFrom } from '@/services/validation/schemas';
import { cn } from '@/utils/cn';
import type { FeedbackSubmission } from '@/types/domain';

const categories = [
  { value: 'service_correction', label: 'A service record is wrong or outdated' },
  { value: 'bug', label: 'Something is broken' },
  { value: 'suggestion', label: 'A suggestion for the product' },
  { value: 'accessibility', label: 'An accessibility problem' },
  { value: 'other', label: 'Something else' },
] as const;

export default function FeedbackPage() {
  useDocumentTitle('Contact & feedback', 'Report an incorrect service record, a bug, an accessibility problem or a suggestion.');

  const services = useAsync(() => listServices({ pageSize: 48, sort: 'name' }), []);
  const [category, setCategory] = useState<(typeof categories)[number]['value']>('service_correction');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [relatedServiceId, setRelatedServiceId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<FeedbackSubmission | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = feedbackSchema.safeParse({ category, subject, message, email, relatedServiceId });
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await mockRequest(
        () => ({
          id: `fb-${Date.now()}`,
          subject: parsed.data.subject,
          category: parsed.data.category,
          message: parsed.data.message,
          email: parsed.data.email || undefined,
          relatedServiceId: parsed.data.relatedServiceId || undefined,
          createdAt: new Date().toISOString(),
          status: 'received' as const,
        }),
        { latency: 800, failureRate: 0.06 },
      );
      if (!result.ok) throw result.error;
      setSubmitted(result.data);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container-page max-w-2xl py-10">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">
            <CheckCircle2 className="size-6" />
          </span>
          <h1 className="mt-3 text-xl font-semibold text-ink-950">Thank you — your feedback was recorded</h1>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-600">
            Reference <strong className="font-mono text-xs">{submitted.id}</strong>. A reviewer checks correction
            reports against the official source before a record is changed. This demo does not send an email — the
            submission exists only for this session.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => setSubmitted(null)}>
              Send another
            </Button>
            <Button onClick={() => window.location.assign('/services')}>Back to services</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-8">
      <PageHeader
        eyebrow="Contact & feedback"
        title="Tell us what needs fixing"
        description="Correction reports are the mechanism that keeps the knowledge base accurate. If a record on this site does not match what your office told you, report it — include the source you checked."
      />

      <div className="mt-6 grid gap-5">
        <SectionCard title="Send feedback">
          <form onSubmit={submit} noValidate className="space-y-4">
            <div>
              <label htmlFor="fb-category" className="mb-1.5 block text-sm font-medium text-ink-800">
                What is this about?
              </label>
              <select
                id="fb-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {category === 'service_correction' && (
              <div>
                <label htmlFor="fb-service" className="mb-1.5 block text-sm font-medium text-ink-800">
                  Which service record?
                </label>
                <select
                  id="fb-service"
                  value={relatedServiceId}
                  onChange={(e) => setRelatedServiceId(e.target.value)}
                  className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm"
                >
                  <option value="">Not specific / another service</option>
                  {services.data?.items.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {service.department}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="fb-subject" className="mb-1.5 block text-sm font-medium text-ink-800">
                Subject <span className="text-red-600">*</span>
              </label>
              <input
                id="fb-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                aria-invalid={errors.subject ? true : undefined}
                aria-describedby={errors.subject ? 'fb-subject-error' : undefined}
                className={cn('h-11 w-full rounded-lg border px-3 text-sm', errors.subject ? 'border-red-400' : 'border-ink-300')}
                placeholder="e.g. Domicile record lists the wrong proof of residence"
              />
              {errors.subject && (
                <p id="fb-subject-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fb-message" className="mb-1.5 block text-sm font-medium text-ink-800">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={2000}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'fb-message-error' : 'fb-message-help'}
                className={cn('w-full rounded-lg border px-3 py-2 text-sm leading-relaxed', errors.message ? 'border-red-400' : 'border-ink-300')}
                placeholder="What did the office tell you? Include the date you visited, the office name, and the official page or document you checked."
              />
              <p id="fb-message-help" className="mt-1 text-xs text-ink-500">
                {message.length}/2000 characters. Do not include your CNIC number or other sensitive identifiers.
              </p>
              {errors.message && (
                <p id="fb-message-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fb-email" className="mb-1.5 block text-sm font-medium text-ink-800">
                Email (optional)
              </label>
              <input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'fb-email-error' : 'fb-email-help'}
                className={cn('h-11 w-full rounded-lg border px-3 text-sm', errors.email ? 'border-red-400' : 'border-ink-300')}
              />
              <p id="fb-email-help" className="mt-1 text-xs text-ink-500">
                Only if you want a reply about this report.
              </p>
              {errors.email && (
                <p id="fb-email-error" className="mt-1 text-xs font-medium text-red-700" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" loading={submitting} leadingIcon={<Send className="size-4" aria-hidden="true" />}>
              {submitting ? 'Sending…' : 'Send feedback'}
            </Button>
          </form>
        </SectionCard>

        <InlineNotice tone="info" title="What happens to a correction report">
          <p>
            A reviewer reopens the service record, compares it with the official source, then republishes it with an
            updated date checked and reviewer name. The change appears in the audit log.
          </p>
        </InlineNotice>
      </div>
    </div>
  );
}
