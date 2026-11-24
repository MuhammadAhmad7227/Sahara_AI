import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Button } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, ErrorState, InlineNotice, Skeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchAdminServices } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { useToast } from '@/components/common/Feedback';
import type { ProcedureStep } from '@/types/domain';

export default function AdminProceduresPage() {
  useDocumentTitle('Admin — procedure steps');
  const { toast } = useToast();
  const services = useAsync(() => fetchAdminServices(), []);
  const [serviceId, setServiceId] = useState('');
  const [steps, setSteps] = useState<ProcedureStep[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const selected = services.data?.find((s) => s.id === serviceId);

  const loadService = (id: string) => {
    setServiceId(id);
    const service = services.data?.find((s) => s.id === id);
    setSteps(service ? [...service.procedure].sort((a, b) => a.stepNumber - b.stepNumber) : []);
  };

  const renumber = (list: ProcedureStep[]) => list.map((s, i) => ({ ...s, stepNumber: i + 1 }));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setSteps(renumber(next));
    toast('Step order updated locally (demo).', 'info');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Procedure steps"
        description="The numbered steps published on the service detail page. Keep each step short and describe where it happens."
      />

      <InlineNotice tone="info" title="Demo editing">
        <p>Edits are held in memory and are not persisted until the API is connected.</p>
      </InlineNotice>

      {services.loading && <Skeleton className="h-10 w-full" />}
      {services.error && <ErrorState message={errorMessage(services.error)} onRetry={services.reload} />}

      {services.data && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="proc-service" className="text-sm font-medium text-ink-800">
            Service
          </label>
          <select
            id="proc-service"
            value={serviceId}
            onChange={(e) => loadService(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-ink-300 bg-white px-2.5 text-sm"
          >
            <option value="">Select a service…</option>
            {services.data.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!serviceId && services.data && (
        <EmptyState title="Select a service" description="Choose a service to edit its ordered procedure." />
      )}

      {selected && (
        <SectionCard title={`${selected.name} — procedure`} description={`${steps.length} step(s)`}>
          {steps.length === 0 ? (
            <EmptyState title="No steps recorded" description="Add the first step below." />
          ) : (
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li key={step.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-ink-200 p-2.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-900 text-[0.625rem] font-semibold text-white tabular" aria-hidden="true">
                    {step.stepNumber}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <input
                      value={step.title}
                      onChange={(e) =>
                        setSteps((current) => current.map((c) => (c.id === step.id ? { ...c, title: e.target.value } : c)))
                      }
                      aria-label={`Step ${index + 1} title`}
                      className="w-full rounded border border-transparent px-1 py-0.5 text-sm font-medium text-ink-900 hover:border-ink-200 focus:border-ink-300 focus:outline-none"
                    />
                    <textarea
                      value={step.instruction}
                      rows={2}
                      onChange={(e) =>
                        setSteps((current) =>
                          current.map((c) => (c.id === step.id ? { ...c, instruction: e.target.value } : c)),
                        )
                      }
                      aria-label={`Step ${index + 1} instruction`}
                      className="w-full rounded border border-transparent px-1 py-0.5 text-xs text-ink-600 hover:border-ink-200 focus:border-ink-300 focus:outline-none"
                    />
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={`Move step ${index + 1} up`}>
                      <ArrowUp className="size-3.5" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === steps.length - 1} className="rounded p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={`Move step ${index + 1} down`}>
                      <ArrowDown className="size-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSteps(renumber(steps.filter((s) => s.id !== step.id)));
                        toast('Step removed locally (demo).', 'info');
                      }}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                      aria-label={`Delete step ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3 sm:flex-row">
            <label htmlFor="new-step" className="sr-only">
              New step title
            </label>
            <input
              id="new-step"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a step title, e.g. Submit the form at the counter"
              className="h-10 flex-1 rounded-lg border border-ink-300 px-3 text-sm"
            />
            <Button
              onClick={() => {
                if (!newTitle.trim()) return;
                setSteps((current) => [
                  ...current,
                  {
                    id: `step-new-${Date.now()}`,
                    stepNumber: current.length + 1,
                    title: newTitle.trim(),
                    instruction: '',
                  },
                ]);
                setNewTitle('');
                toast('Step added locally (demo).', 'info');
              }}
              leadingIcon={<Plus className="size-4" aria-hidden="true" />}
            >
              Add step
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
