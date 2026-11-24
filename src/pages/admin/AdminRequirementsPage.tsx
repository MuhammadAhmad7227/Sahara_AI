import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, ErrorState, InlineNotice, Skeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchAdminServices } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { useToast } from '@/components/common/Feedback';
import type { Requirement } from '@/types/domain';

/**
 * Requirement management for one service.
 * Reordering, adding, deleting and toggling mandatory are all demonstrated on
 * local state; the API call that would persist them is marked TODO.
 */
export default function AdminRequirementsPage() {
  useDocumentTitle('Admin — requirements');
  const { toast } = useToast();
  const services = useAsync(() => fetchAdminServices(), []);
  const [serviceId, setServiceId] = useState('');
  const [items, setItems] = useState<Requirement[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const selected = services.data?.find((s) => s.id === serviceId);

  const loadService = (id: string) => {
    setServiceId(id);
    const service = services.data?.find((s) => s.id === id);
    setItems(service ? [...service.requirements].sort((a, b) => a.position - b.position) : []);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setItems(next.map((item, i) => ({ ...item, position: i + 1 })));
    toast('Order updated locally. Reordering persists once the API is connected.', 'info');
  };

  const remove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id).map((item, i) => ({ ...item, position: i + 1 })));
    toast('Requirement removed locally (demo).', 'info');
  };

  const add = () => {
    if (!newTitle.trim()) return;
    setItems((current) => [
      ...current,
      {
        id: `req-new-${Date.now()}`,
        title: newTitle.trim(),
        details: '',
        mandatory: true,
        position: current.length + 1,
      },
    ]);
    setNewTitle('');
    toast('Requirement added locally (demo).', 'info');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Requirements"
        description="The requirement list for a service drives the public checklist and the readiness checker. Keep it in the order the office asks for documents."
      />

      <InlineNotice tone="info" title="Demo editing">
        <p>Changes on this screen are held in memory only. They show the control set the backend will persist.</p>
      </InlineNotice>

      {services.loading && <Skeleton className="h-10 w-full" />}
      {services.error && <ErrorState message={errorMessage(services.error)} onRetry={services.reload} />}

      {services.data && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="req-service" className="text-sm font-medium text-ink-800">
            Service
          </label>
          <select
            id="req-service"
            value={serviceId}
            onChange={(e) => loadService(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-ink-300 bg-white px-2.5 text-sm"
          >
            <option value="">Select a service…</option>
            {services.data.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!serviceId && services.data && (
        <EmptyState title="Select a service" description="Choose a service to manage its ordered requirement list." />
      )}

      {selected && (
        <>
          <SectionCard title={`${selected.name} — requirements`} description={`${items.length} item(s)`}>
            {items.length === 0 ? (
              <EmptyState title="No requirements" description="Add the first requirement below." />
            ) : (
              <ol className="space-y-2">
                {items.map((item, index) => (
                  <li key={item.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-ink-200 p-2.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded bg-ink-100 text-xs font-semibold tabular text-ink-600" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        value={item.title}
                        onChange={(e) =>
                          setItems((current) => current.map((c) => (c.id === item.id ? { ...c, title: e.target.value } : c)))
                        }
                        aria-label={`Requirement ${index + 1} title`}
                        className="w-full rounded border border-transparent px-1 py-0.5 text-sm font-medium text-ink-900 hover:border-ink-200 focus:border-ink-300 focus:outline-none"
                      />
                      <input
                        value={item.details}
                        onChange={(e) =>
                          setItems((current) => current.map((c) => (c.id === item.id ? { ...c, details: e.target.value } : c)))
                        }
                        placeholder="Description shown to citizens"
                        aria-label={`Requirement ${index + 1} description`}
                        className="mt-0.5 w-full rounded border border-transparent px-1 py-0.5 text-xs text-ink-600 hover:border-ink-200 focus:border-ink-300 focus:outline-none"
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setItems((current) => current.map((c) => (c.id === item.id ? { ...c, mandatory: !c.mandatory } : c)))
                        }
                        className="rounded"
                        aria-pressed={item.mandatory}
                      >
                        <Badge tone={item.mandatory ? 'brand' : 'neutral'}>{item.mandatory ? 'Required' : 'Optional'}</Badge>
                      </button>
                      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={`Move ${item.title} up`}>
                        <ArrowUp className="size-3.5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="rounded p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={`Move ${item.title} down`}>
                        <ArrowDown className="size-3.5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => remove(item.id)} className="rounded p-1 text-red-600 hover:bg-red-50" aria-label={`Delete ${item.title}`}>
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3 sm:flex-row">
              <label htmlFor="new-req" className="sr-only">
                New requirement title
              </label>
              <input
                id="new-req"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="Add a requirement, e.g. Copy of CNIC"
                className="h-10 flex-1 rounded-lg border border-ink-300 px-3 text-sm"
              />
              <Button onClick={add} leadingIcon={<Plus className="size-4" aria-hidden="true" />}>
                Add requirement
              </Button>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
