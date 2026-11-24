import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ClipboardList, Download, Info, Printer, RotateCcw } from 'lucide-react';
import { Button, LinkButton } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { InlineNotice, Skeleton } from '@/components/common/States';
import { ReadinessControl } from '@/components/services/RequirementItem';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { checkReadiness } from '@/services/api/readiness';
import { listServices } from '@/services/api/services';
import { errorMessage } from '@/services/api/errors';
import { cn, formatDateTime } from '@/utils/cn';
import type { ReadinessItemState, ReadinessReport } from '@/types/domain';

export default function ReadinessPage() {
  useDocumentTitle(
    'Readiness checker',
    'Compare the documents you have against the requirement list stored for a service. The checker reports completeness — it does not predict whether an office will accept your application.',
  );

  const [params, setParams] = useSearchParams();
  const slug = params.get('service') ?? '';

  const services = useAsync(() => listServices({ pageSize: 48, sort: 'name' }), []);
  const [states, setStates] = useState<Record<string, ReadinessItemState>>({});
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const selected = useMemo(
    () => services.data?.items.find((s) => s.slug === slug) ?? null,
    [services.data, slug],
  );

  // Reset answers when the service changes.
  useEffect(() => {
    setStates({});
    setReport(null);
    setCheckError(null);
  }, [slug]);

  const answered = Object.keys(states).length;
  const total = selected?.requirements.length ?? 0;

  const runCheck = async () => {
    if (!selected) return;
    setChecking(true);
    setCheckError(null);
    try {
      const result = await checkReadiness(selected.slug, states);
      setReport(result);
    } catch (err) {
      setCheckError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setStates({});
    setReport(null);
    setCheckError(null);
  };

  const printReport = () => {
    if (!report) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    const rows = report.items
      .map(
        (item) =>
          `<tr><td>${item.title}${item.mandatory ? ' *' : ''}</td><td>${item.state.replace('_', ' ')}</td></tr>`,
      )
      .join('');
    win.document.write(`<!doctype html><html><head><title>Readiness report</title>
      <style>body{font-family:system-ui;padding:40px;max-width:700px;margin:auto;color:#1b2221}
      table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border:1px solid #dde1e1;padding:8px;text-align:left;font-size:13px}
      h1{font-size:20px}.note{font-size:12px;color:#6e7a79;line-height:1.6;border-top:1px solid #dde1e1;padding-top:10px;margin-top:20px}</style>
      </head><body><h1>Document readiness — ${report.serviceName}</h1>
      <p style="font-size:12px;color:#6e7a79">Generated ${formatDateTime(report.generatedAt)} · demonstration build</p>
      <table><thead><tr><th>Requirement</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
      <p><strong>${report.summary.complete} of ${report.summary.total} items complete.</strong></p>
      <p>${report.statement}</p>
      <div class="note">This report describes the checklist stored by Sahara AI. It is not an official assessment, not an acceptance decision, and not a government document.</div>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Readiness checker"
        title="Are your documents ready?"
        description="Choose a service, mark each item, and see what still needs your attention. The result describes the stored checklist only — the office decides whether to accept an application."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0 space-y-4">
          {/* Service selection */}
          <SectionCard title="1. Choose the service" description="Only services with a stored requirement list can be checked.">
            {services.loading && <Skeleton className="h-11 w-full" />}
            {services.error && (
              <p className="text-sm text-red-700">Could not load services: {errorMessage(services.error)}</p>
            )}
            {services.data && (
              <div className="space-y-1.5">
                <label htmlFor="readiness-service" className="sr-only">
                  Service
                </label>
                <select
                  id="readiness-service"
                  value={slug}
                  onChange={(e) => setParams(e.target.value ? { service: e.target.value } : {}, { replace: true })}
                  className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm"
                >
                  <option value="">Select a service…</option>
                  {services.data.items.map((service) => (
                    <option key={service.id} value={service.slug}>
                      {service.name} — {service.department}
                    </option>
                  ))}
                </select>
                {selected && (
                  <p className="text-xs text-ink-500">
                    {selected.requirements.length} requirement(s) stored ·{' '}
                    {selected.lastVerifiedAt ? 'record checked' : 'record not yet verified'} ·{' '}
                    <LinkButton to={`/services/${selected.slug}`} variant="ghost" size="sm" className="!h-auto !p-0 text-xs font-normal underline">
                      view the service record
                    </LinkButton>
                  </p>
                )}
              </div>
            )}
          </SectionCard>

          {/* Checklist */}
          {selected && (
            <SectionCard
              title="2. Mark each item"
              description="For each requirement, choose Complete, Missing, or Needs review. You are not asked to upload anything."
              action={
                <span className="text-xs text-ink-500 tabular" aria-live="polite">
                  {answered}/{total} marked
                </span>
              }
            >
              <ul className="space-y-2">
                {[...selected.requirements]
                  .sort((a, b) => a.position - b.position)
                  .map((requirement) => (
                    <ReadinessControl
                      key={requirement.id}
                      requirement={requirement}
                      state={states[requirement.id] ?? 'missing'}
                      onChange={(next) => setStates((prev) => ({ ...prev, [requirement.id]: next }))}
                    />
                  ))}
              </ul>

              {checkError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                  {checkError}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                <Button onClick={() => void runCheck()} loading={checking} leadingIcon={<ClipboardList className="size-4" aria-hidden="true" />}>
                  {checking ? 'Checking…' : 'Check readiness'}
                </Button>
                <Button variant="ghost" onClick={reset} leadingIcon={<RotateCcw className="size-4" aria-hidden="true" />}>
                  Reset answers
                </Button>
                <p className="text-xs text-ink-500">{answered < total ? `${total - answered} item(s) not marked yet.` : 'All items marked.'}</p>
              </div>
            </SectionCard>
          )}

          {/* Report */}
          {report && (
            <SectionCard title="3. Readiness summary" description="A description of the checklist, not a decision by any office.">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5">
                  <p className="text-xs text-ink-500">Total items</p>
                  <p className="text-xl font-semibold tabular text-ink-900">{report.summary.total}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <p className="text-xs text-emerald-800">Complete</p>
                  <p className="text-xl font-semibold tabular text-emerald-900">{report.summary.complete}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="text-xs text-red-800">Missing</p>
                  <p className="text-xl font-semibold tabular text-red-900">{report.summary.missing}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="text-xs text-amber-800">Needs review</p>
                  <p className="text-xl font-semibold tabular text-amber-900">{report.summary.needsReview}</p>
                </div>
              </div>

              <div
                className={cn(
                  'mt-3 rounded-lg border p-3.5',
                  report.summary.mandatoryMissing === 0
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-amber-200 bg-amber-50/70',
                )}
              >
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                  {report.summary.mandatoryMissing === 0 ? (
                    <CheckCircle2 className="size-4 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="size-4 text-amber-700" aria-hidden="true" />
                  )}
                  {report.summary.complete} of {report.summary.total} required items completed
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{report.statement}</p>
              </div>

              <ul className="mt-3 divide-y divide-ink-100 text-sm">
                {report.items.map((item) => (
                  <li key={item.requirementId} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 text-ink-800">
                      {item.title}
                      {item.mandatory && <span className="ms-1 text-xs text-ink-500">(required)</span>}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                        item.state === 'complete' && 'bg-emerald-50 text-emerald-800 ring-emerald-200',
                        item.state === 'missing' && 'bg-red-50 text-red-800 ring-red-200',
                        item.state === 'needs_review' && 'bg-amber-50 text-amber-900 ring-amber-200',
                      )}
                    >
                      {item.state.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                <Button variant="outline" onClick={printReport} leadingIcon={<Printer className="size-4" aria-hidden="true" />}>
                  Print / save report
                </Button>
                <LinkButton to="/complaints" variant="ghost" leadingIcon={<Download className="size-4" aria-hidden="true" />}>
                  Draft a follow-up complaint
                </LinkButton>
              </div>
            </SectionCard>
          )}

          {!selected && !services.loading && (
            <InlineNotice tone="info" title="No service selected">
              <p>
                Pick a service above to load its stored checklist. If a service is not listed, its requirements have
                not been entered into the knowledge base yet — confirm them with the department.
              </p>
            </InlineNotice>
          )}
        </div>

        <aside className="space-y-4">
          <InlineNotice tone="warning" title="What this does not say">
            <p>
              The report never says your application will be accepted. It compares what you marked with what the
              knowledge base currently stores. Requirements change, and district offices can ask for more.
            </p>
          </InlineNotice>

          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <Info className="size-4 text-ink-400" aria-hidden="true" /> Status meanings
            </h2>
            <dl className="mt-2 space-y-2 text-xs">
              <div>
                <dt className="font-semibold text-emerald-800">Complete</dt>
                <dd className="text-ink-600">You have this document ready.</dd>
              </div>
              <div>
                <dt className="font-semibold text-red-800">Missing</dt>
                <dd className="text-ink-600">You do not have it yet, or it has expired.</dd>
              </div>
              <div>
                <dt className="font-semibold text-amber-800">Needs review</dt>
                <dd className="text-ink-600">You have something, but you are unsure it is the right version.</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-4 text-xs leading-relaxed text-ink-600">
            Nothing you mark here is uploaded. Answers stay in this browser tab and are cleared when you leave the
            page.
          </div>
        </aside>
      </div>
    </div>
  );
}
