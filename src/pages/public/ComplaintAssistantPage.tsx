import { useMemo, useRef, useState } from 'react';
import { Copy, Download, FileText, Printer, Save, Wand2 } from 'lucide-react';
import { Button, LinkButton } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { InlineNotice } from '@/components/common/States';
import { DraftDocument } from '@/components/applications/DraftDocument';
import { useToast } from '@/components/common/Feedback';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { applicationTemplates, templateById } from '@/data/applicationTemplates';
import { generateApplication } from '@/services/api/applications';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';
import type { ApplicationDraft } from '@/types/domain';

/** Complaint-capable templates only. */
const complaintTemplates = applicationTemplates.filter(
  (t) => t.category === 'complaint' || t.id === 'police-application' || t.id === 'general-request',
);

export default function ComplaintAssistantPage() {
  useDocumentTitle(
    'Complaint assistant',
    'Write a clear, structured complaint about a utility, municipal or police matter. You submit it through the official channel yourself.',
  );

  const { toast } = useToast();
  const [templateId, setTemplateId] = useState(complaintTemplates[0]?.id ?? 'electricity-complaint');
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const template = useMemo(() => templateById(templateId), [templateId]);

  const validate = () => {
    if (!template) return false;
    const next: Record<string, string> = {};
    for (const field of template.fields) {
      const value = values[field.key]?.trim() ?? '';
      if (field.required && !value) next[field.key] = `${field.label} is required.`;
      if (value && field.type === 'tel' && !/^[0-9+\-\s()]{7,20}$/.test(value)) {
        next[field.key] = 'Enter a valid contact number.';
      }
      if (value && field.key === 'cnic' && !/^\d{5}-\d{7}-\d$/.test(value)) {
        next[field.key] = 'CNIC format should be 12345-1234567-1.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const generate = async () => {
    if (!template) return;
    if (!validate()) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setBusy(true);
    setApiError(null);
    try {
      const result = await generateApplication({ templateId: template.id, inputs: values });
      setDraft(result);
      toast('Complaint draft generated. Review it before you submit it.', 'success');
    } catch (err) {
      setApiError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.body);
      toast('Complaint copied to the clipboard.', 'success');
    } catch {
      toast('Copy failed — please select the text and copy it manually.', 'warning');
    }
  };

  const save = () => {
    if (!draft) return;
    try {
      const key = 'sahara.demo.drafts';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as ApplicationDraft[];
      localStorage.setItem(key, JSON.stringify([draft, ...existing.filter((d) => d.id !== draft.id)].slice(0, 30)));
      toast('Saved to your drafts (this browser).', 'success');
    } catch {
      toast('The draft could not be saved in this browser.', 'warning');
    }
  };

  const print = () => {
    if (!draft) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Complaint — draft</title>
      <style>body{font-family:Georgia,serif;line-height:1.7;padding:48px;max-width:720px;margin:0 auto}
      .band{background:#fdfaf4;border-bottom:2px dashed #c8852f;padding:8px 0;font:600 11px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#7f532d;margin-bottom:20px}
      pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:14px}</style></head><body>
      <div class="band">Draft — not an official complaint registration · Sahara AI</div>
      <pre>${draft.body.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] ?? c)}</pre>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Complaint assistant"
        title="Write a complaint that is easy to act on"
        description="Give the department, the problem, the date and the location. Sahara AI produces a structured draft you can edit and submit through the official complaint channel yourself."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-4">
          <SectionCard title="Complaint type" description="Choose the office the complaint is for.">
            <div className="grid gap-2 sm:grid-cols-2">
              {complaintTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={templateId === t.id}
                  onClick={() => {
                    setTemplateId(t.id);
                    setValues({});
                    setDraft(null);
                    setErrors({});
                  }}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-2.5 text-start text-sm transition-colors',
                    templateId === t.id
                      ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-200'
                      : 'border-ink-200 hover:border-brand-300',
                  )}
                >
                  <FileText className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
                  <span>
                    <span className="block font-medium text-ink-900">{t.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{t.department}</span>
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>

          {template && (
            <SectionCard title="Complaint details" description="Write only what you know. Do not guess at facts.">
              <form
                ref={formRef}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  void generate();
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {template.fields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : undefined}>
                      <label htmlFor={`c-${field.key}`} className="mb-1.5 block text-sm font-medium text-ink-800">
                        {field.label}
                        {!field.required && <span className="ms-1.5 text-xs font-normal text-ink-500">optional</span>}
                        {field.required && (
                          <span className="ms-1 text-red-600" aria-hidden="true">
                            *
                          </span>
                        )}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          id={`c-${field.key}`}
                          rows={5}
                          maxLength={field.maxLength}
                          value={values[field.key] ?? ''}
                          placeholder={field.placeholder}
                          onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          aria-invalid={errors[field.key] ? true : undefined}
                          aria-describedby={errors[field.key] ? `ce-${field.key}` : undefined}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm leading-relaxed',
                            errors[field.key] ? 'border-red-400' : 'border-ink-300',
                          )}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          id={`c-${field.key}`}
                          value={values[field.key] ?? ''}
                          onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          aria-invalid={errors[field.key] ? true : undefined}
                          className={cn('h-11 w-full rounded-lg border bg-white px-3 text-sm', errors[field.key] ? 'border-red-400' : 'border-ink-300')}
                        >
                          <option value="">Select…</option>
                          {field.options?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`c-${field.key}`}
                          type={field.type}
                          maxLength={field.maxLength}
                          value={values[field.key] ?? ''}
                          placeholder={field.placeholder}
                          onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          aria-invalid={errors[field.key] ? true : undefined}
                          aria-describedby={errors[field.key] ? `ce-${field.key}` : undefined}
                          className={cn('h-11 w-full rounded-lg border px-3 text-sm', errors[field.key] ? 'border-red-400' : 'border-ink-300')}
                        />
                      )}
                      {errors[field.key] && (
                        <p id={`ce-${field.key}`} className="mt-1 text-xs font-medium text-red-700" role="alert">
                          {errors[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {apiError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                    {apiError}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  <Button type="submit" loading={busy} leadingIcon={<Wand2 className="size-4" aria-hidden="true" />}>
                    {busy ? 'Generating…' : 'Generate complaint draft'}
                  </Button>
                  <p className="text-xs text-ink-500">The result is a draft. It is not registered anywhere.</p>
                </div>
              </form>
            </SectionCard>
          )}

          {draft && (
            <SectionCard
              title="Your complaint draft"
              description="Edit the text in your editor of choice, then submit it through the official complaint channel."
            >
              <DraftDocument draft={draft} />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void copy()} leadingIcon={<Copy className="size-4" aria-hidden="true" />}>
                  Copy
                </Button>
                <Button variant="outline" onClick={print} leadingIcon={<Printer className="size-4" aria-hidden="true" />}>
                  Print / PDF
                </Button>
                <Button variant="outline" onClick={save} leadingIcon={<Save className="size-4" aria-hidden="true" />}>
                  Save draft
                </Button>
                <LinkButton to="/emergency" variant="ghost" leadingIcon={<Download className="size-4" aria-hidden="true" />}>
                  Official channels
                </LinkButton>
              </div>
            </SectionCard>
          )}
        </div>

        <aside className="space-y-4">
          <InlineNotice tone="info" title="What a good complaint contains">
            <ul className="ms-4 list-disc space-y-1 text-xs leading-relaxed">
              <li>The office you are writing to.</li>
              <li>The exact date and time of the problem.</li>
              <li>What you observed, in order, without guesses.</li>
              <li>What you have already reported and any reference number.</li>
              <li>What you are asking them to do.</li>
            </ul>
          </InlineNotice>

          <InlineNotice tone="warning" title="Complaint vs emergency">
            <p>
              If someone is in danger or a crime is in progress, contact the emergency service directly. A written
              complaint is not an emergency channel.
            </p>
            <LinkButton to="/emergency" variant="outline" size="sm" className="mt-2">
              Open emergency centre
            </LinkButton>
          </InlineNotice>

          <div className="rounded-xl border border-ink-200 bg-white p-4 text-xs leading-relaxed text-ink-600">
            Complaints prepared here are drafts. Keep the acknowledgement or complaint number you receive from the
            office — Sahara AI cannot track it for you.
          </div>
        </aside>
      </div>
    </div>
  );
}
