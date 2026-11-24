import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge, ReviewStatusBadge, VerificationBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, ErrorState, InlineNotice, Skeleton } from '@/components/common/States';
import { SourceList } from '@/components/services/SourceCard';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchAdminService } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { useToast } from '@/components/common/Feedback';
import { serviceCategories } from '@/data/services';
import { formatDate } from '@/utils/cn';

/**
 * Create/edit form for a service record.
 * Fields mirror the planned Pydantic schema. In demo mode the form is fully
 * editable but saving reports that persistence requires the backend — it never
 * shows a false "saved" confirmation.
 */
export default function AdminServiceEditPage() {
  const { id = '' } = useParams();
  const { toast } = useToast();
  const { data: service, loading, error, reload } = useAsync(() => fetchAdminService(id), [id]);
  useDocumentTitle(service ? `Admin — ${service.name}` : 'Admin — service record');

  const [form, setForm] = useState<Record<string, string>>({});
  const [initialised, setInitialised] = useState(false);
  const [saving, setSaving] = useState(false);

  if (service && !initialised) {
    setInitialised(true);
    setForm({
      name: service.name,
      department: service.department,
      jurisdiction: service.jurisdiction,
      category: service.category,
      shortDescription: service.shortDescription,
      description: service.description,
      status: service.status,
      feeAmount: service.fee.amount === null ? '' : String(service.fee.amount),
      feeNote: service.fee.note ?? '',
    });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return error.status === 404 ? (
      <EmptyState
        title="Service record not found"
        description="This record does not exist in the demonstration dataset."
        action={<Link to="/admin/services" className="text-sm font-medium text-brand-800 underline">Back to services</Link>}
      />
    ) : (
      <ErrorState message={errorMessage(error)} onRetry={reload} />
    );
  }

  if (!service) return null;

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    // Honest outcome: nothing is persisted because there is no backend yet.
    toast('This build does not persist admin edits. Connect the API to save records.', 'info');
  };

  const field = (key: string) => form[key] ?? '';
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <Link to="/admin/services" className="inline-flex items-center gap-1 text-sm font-medium text-brand-800 hover:underline">
        <ArrowLeft className="size-4 dir-arrow" aria-hidden="true" /> All services
      </Link>

      <PageHeader
        title={service.name}
        description={`${service.department} · ${service.jurisdiction}`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            <VerificationBadge status={service.verification} />
            <ReviewStatusBadge status={service.status} />
          </div>
        }
      />

      <InlineNotice tone="warning" title="Changes are not saved in this build">
        <p>
          The form is wired for the FastAPI service schema, but saving requires the backend. No edit made here reaches
          the stored data or a citizen.
        </p>
      </InlineNotice>

      <SectionCard title="Service details" description="The public description and classification of this record.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="ed-name" className="mb-1.5 block text-sm font-medium text-ink-800">
              Service name
            </label>
            <input id="ed-name" value={field('name')} onChange={(e) => set('name', e.target.value)} className="h-11 w-full rounded-lg border border-ink-300 px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="ed-department" className="mb-1.5 block text-sm font-medium text-ink-800">
              Department
            </label>
            <input id="ed-department" value={field('department')} onChange={(e) => set('department', e.target.value)} className="h-11 w-full rounded-lg border border-ink-300 px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="ed-jurisdiction" className="mb-1.5 block text-sm font-medium text-ink-800">
              Jurisdiction
            </label>
            <select id="ed-jurisdiction" value={field('jurisdiction')} onChange={(e) => set('jurisdiction', e.target.value)} className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm">
              {['Punjab', 'Federal', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan'].map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ed-category" className="mb-1.5 block text-sm font-medium text-ink-800">
              Category
            </label>
            <select id="ed-category" value={field('category')} onChange={(e) => set('category', e.target.value)} className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm">
              {serviceCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ed-status" className="mb-1.5 block text-sm font-medium text-ink-800">
              Status
            </label>
            <select id="ed-status" value={field('status')} onChange={(e) => set('status', e.target.value)} className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm">
              {['draft', 'pending_review', 'approved', 'published', 'archived', 'rejected'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ed-short" className="mb-1.5 block text-sm font-medium text-ink-800">
              Short description (shown on cards)
            </label>
            <textarea id="ed-short" rows={2} value={field('shortDescription')} onChange={(e) => set('shortDescription', e.target.value)} className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ed-description" className="mb-1.5 block text-sm font-medium text-ink-800">
              Full description
            </label>
            <textarea id="ed-description" rows={5} value={field('description')} onChange={(e) => set('description', e.target.value)} className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm leading-relaxed" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Fee" description="Leave the amount empty until an official fee has been confirmed.">
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <div>
            <label htmlFor="ed-fee" className="mb-1.5 block text-sm font-medium text-ink-800">
              Amount (PKR)
            </label>
            <input
              id="ed-fee"
              type="number"
              min={0}
              value={field('feeAmount')}
              onChange={(e) => set('feeAmount', e.target.value)}
              placeholder="Not verified"
              className="h-11 w-full rounded-lg border border-ink-300 px-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ed-fee-note" className="mb-1.5 block text-sm font-medium text-ink-800">
              Fee note
            </label>
            <input id="ed-fee-note" value={field('feeNote')} onChange={(e) => set('feeNote', e.target.value)} className="h-11 w-full rounded-lg border border-ink-300 px-3 text-sm" />
          </div>
        </div>
        {!field('feeAmount') && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800">
            <ShieldAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            With no amount, the citizen-facing page shows “Fee information not currently verified” instead of a guess.
          </p>
        )}
      </SectionCard>

      <SectionCard
        title="Requirements and procedure"
        description="Ordered lists that drive the public detail page and the readiness checker."
        action={
          <div className="flex gap-1.5">
            <Link to="/admin/requirements" className="text-xs font-medium text-brand-800 hover:underline">
              Manage requirements
            </Link>
            <Link to="/admin/procedures" className="text-xs font-medium text-brand-800 hover:underline">
              Manage steps
            </Link>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-ink-900">Requirements ({service.requirements.length})</h3>
            <ol className="space-y-1 text-sm">
              {service.requirements.map((req) => (
                <li key={req.id} className="flex items-start justify-between gap-2 rounded border border-ink-200 px-2.5 py-1.5">
                  <span className="text-ink-700">{req.title}</span>
                  <Badge tone={req.mandatory ? 'brand' : 'neutral'}>{req.mandatory ? 'Required' : 'Optional'}</Badge>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-ink-900">Procedure steps ({service.procedure.length})</h3>
            <ol className="space-y-1 text-sm">
              {service.procedure.map((step) => (
                <li key={step.id} className="flex gap-2 rounded border border-ink-200 px-2.5 py-1.5">
                  <span className="font-semibold tabular text-ink-500">{step.stepNumber}.</span>
                  <span className="text-ink-700">{step.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Sources"
        description={`Last verified ${service.lastVerifiedAt ? formatDate(service.lastVerifiedAt) : '— not recorded'}`}
        action={
          <Link to="/admin/sources" className="text-xs font-medium text-brand-800 hover:underline">
            Source management
          </Link>
        }
      >
        <SourceList sources={service.sources} />
      </SectionCard>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => void save()} loading={saving} leadingIcon={<Save className="size-4" aria-hidden="true" />}>
          Save changes
        </Button>
        <Button variant="outline" onClick={() => window.location.assign('/admin/services')}>
          Cancel
        </Button>
        <p className="text-xs text-ink-500">Saving requires the backend API.</p>
      </div>
    </div>
  );
}
