import { useState } from 'react';
import { AlertTriangle, Lock, Save } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Button } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { InlineNotice } from '@/components/common/States';
import { useToast } from '@/components/common/Feedback';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { apiConfig } from '@/services/api/client';

export default function AdminSettingsPage() {
  useDocumentTitle('Admin — settings');
  const { toast } = useToast();
  const [reviewInterval, setReviewInterval] = useState('90');
  const [requireSource, setRequireSource] = useState(true);
  const [requireReviewer, setRequireReviewer] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [rateLimit, setRateLimit] = useState('20');

  return (
    <div className="space-y-4">
      <PageHeader title="System settings" description="Publication rules, review intervals and AI feature switches. These are configuration, not content." />

      <InlineNotice tone="warning" title="Frontend-only build">
        <p>
          These controls show the settings the backend will expose. Values are not persisted, and the publication rules
          below must also be enforced on the server — a browser toggle is not a security control.
        </p>
      </InlineNotice>

      <SectionCard title="Publication rules" description="Applied before a record can move to Published.">
        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-ink-800">
            <input type="checkbox" checked={requireSource} onChange={(e) => setRequireSource(e.target.checked)} className="mt-0.5 size-4 accent-brand-800" />
            <span>
              Require an approved source with a URL before publication
              <span className="mt-0.5 block text-xs text-ink-500">Without this, a record cannot carry provenance.</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-ink-800">
            <input type="checkbox" checked={requireReviewer} onChange={(e) => setRequireReviewer(e.target.checked)} className="mt-0.5 size-4 accent-brand-800" />
            <span>
              Require a named reviewer and a date checked
              <span className="mt-0.5 block text-xs text-ink-500">An anonymous record cannot be audited.</span>
            </span>
          </label>
          <div>
            <label htmlFor="review-interval" className="mb-1.5 block text-sm font-medium text-ink-800">
              Review interval (days)
            </label>
            <input
              id="review-interval"
              type="number"
              min={30}
              max={365}
              value={reviewInterval}
              onChange={(e) => setReviewInterval(e.target.value)}
              className="h-10 w-32 rounded-lg border border-ink-300 px-3 text-sm"
            />
            <p className="mt-1 text-xs text-ink-500">
              After this interval a published record is marked “Review overdue” automatically.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="AI features" description="The assistant never sees records that are not approved or published.">
        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-ink-800">
            <input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} className="mt-0.5 size-4 accent-brand-800" />
            <span>
              Assistant enabled
              <span className="mt-0.5 block text-xs text-ink-500">
                When disabled, the assistant shows a maintenance message and the non-AI tools keep working.
              </span>
            </span>
          </label>
          <div>
            <label htmlFor="rate-limit" className="mb-1.5 block text-sm font-medium text-ink-800">
              AI requests per minute per user
            </label>
            <input
              id="rate-limit"
              type="number"
              min={1}
              max={120}
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="h-10 w-32 rounded-lg border border-ink-300 px-3 text-sm"
            />
            <p className="mt-1 text-xs text-ink-500">Rate limiting protects cost and availability; it must be enforced server-side.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Environment" description="Values the frontend is currently built with. Secrets must never appear here.">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-ink-200 p-2.5">
            <dt className="text-xs text-ink-500">API mode</dt>
            <dd className="font-mono text-xs font-medium text-ink-900">{apiConfig.mode}</dd>
          </div>
          <div className="rounded-lg border border-ink-200 p-2.5">
            <dt className="text-xs text-ink-500">API base URL</dt>
            <dd className="truncate font-mono text-xs font-medium text-ink-900">{apiConfig.baseUrl || '(not set — mock transport)'}</dd>
          </div>
        </dl>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-500">
          <Lock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Model keys, database credentials and session secrets live in backend environment variables only. This frontend
          reads none of them.
        </p>
      </SectionCard>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => toast('Settings are not persisted in this build. The backend will store them.', 'info')} leadingIcon={<Save className="size-4" aria-hidden="true" />}>
          Save settings
        </Button>
        <p className="flex items-center gap-1 text-xs text-ink-500">
          <AlertTriangle className="size-3.5 text-amber-600" aria-hidden="true" />
          Changes here do not affect the running demo.
        </p>
      </div>
    </div>
  );
}
