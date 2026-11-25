import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  Download,
  FileSignature,
  FileText,
  Printer,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { Button, LinkButton } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { InlineNotice } from '@/components/common/States';
import { useToast } from '@/components/common/Feedback';
import { WizardProgress } from '@/components/common/Wizard';
import { DraftDocument } from '@/components/applications/DraftDocument';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { applicationTemplates, templateById } from '@/data/applicationTemplates';
import { demoServices } from '@/data/services';
import { generateApplication } from '@/services/api/applications';
import { errorMessage } from '@/services/api/errors';
import { copyText, cn, formatDate } from '@/utils/cn';
import type { ApplicationDraft, ApplicationFieldDef, ApplicationTemplate } from '@/types/domain';

const steps = [
  { id: 'department', label: 'Department' },
  { id: 'type', label: 'Application type' },
  { id: 'details', label: 'Your details' },
  { id: 'generate', label: 'Generate draft' },
  { id: 'review', label: 'Review & edit' },
  { id: 'preview', label: 'Preview' },
  { id: 'download', label: 'Download' },
];

/** Validate one field with an explanation of what to correct. */
function validateField(field: ApplicationFieldDef, value: string): string | undefined {
  const trimmed = value?.trim() ?? '';
  if (field.required && !trimmed) return `${field.label} is required.`;
  if (!trimmed) return undefined;
  if (field.maxLength && trimmed.length > field.maxLength) {
    return `${field.label} must be ${field.maxLength} characters or fewer.`;
  }
  if (field.type === 'tel' && !/^[0-9+\-\s()]{7,20}$/.test(trimmed)) {
    return 'Enter a valid contact number (digits, spaces and + - ( ) only).';
  }
  if (field.key === 'cnic' && !/^\d{5}-\d{7}-\d$/.test(trimmed)) {
    return 'CNIC must use the format 12345-1234567-1, or leave it blank.';
  }
  if (field.type === 'date') {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) return 'Enter a valid date.';
    if (date.getTime() > Date.now() + 86_400_000) return 'The date cannot be in the future.';
  }
  return undefined;
}

export default function ApplicationGeneratorPage() {
  useDocumentTitle(
    'Application generator',
    'Prepare an editable draft application for a public office. The draft is clearly labelled and is not an official government form.',
  );

  const [params] = useSearchParams();
  const { toast } = useToast();
  const serviceSlug = params.get('service');

  const [step, setStep] = useState(0);
  const [maxReachable, setMaxReachable] = useState(0);
  const [department, setDepartment] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [editedBody, setEditedBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  // Deep link from a service page: preselect the matching template.
  useEffect(() => {
    if (!serviceSlug) return;
    const service = demoServices.find((s) => s.slug === serviceSlug);
    if (!service) return;
    const match = applicationTemplates.find((t) => t.serviceId === service.id);
    if (match) {
      setDepartment(match.department);
      setTemplateId(match.id);
      setStep(2);
      setMaxReachable(2);
    }
  }, [serviceSlug]);

  const departments = useMemo(
    () => Array.from(new Set(applicationTemplates.map((t) => t.department))).sort(),
    [],
  );

  const templatesForDepartment = useMemo(
    () => applicationTemplates.filter((t) => t.department === department),
    [department],
  );

  const template = templateId ? templateById(templateId) : undefined;
  const groundedService = template?.serviceId
    ? demoServices.find((s) => s.id === template.serviceId)
    : undefined;

  const goTo = (next: number) => {
    setStep(next);
    setMaxReachable((current) => Math.max(current, next));
    requestAnimationFrame(() => headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const validateDetails = (): boolean => {
    if (!template) return false;
    const nextErrors: Record<string, string> = {};
    for (const field of template.fields) {
      const message = validateField(field, values[field.key] ?? '');
      if (message) nextErrors[field.key] = message;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!template) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const result = await generateApplication({ templateId: template.id, inputs: values });
      setDraft(result);
      setEditedBody(result.body);
      goTo(4);
      toast('Draft generated. Review every line before you use it.', 'success');
    } catch (err) {
      setGenerateError(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const printDraft = () => {
    if (!draft) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) {
      toast('The print window was blocked. Allow pop-ups for this site, or copy the text instead.', 'warning');
      return;
    }
    win.document.write(`<!doctype html><html><head><title>${draft.templateName} — Draft</title>
      <style>
        body{font-family:Georgia,serif;line-height:1.7;padding:48px;max-width:720px;margin:0 auto;color:#14201c}
        .band{border-bottom:2px dashed #c9a227;background:#fcfbf7;padding:8px 0;font:600 11px/1.4 system-ui;letter-spacing:.08em;text-transform:uppercase;color:#6e5330;margin-bottom:24px}
        pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:14px}
        .foot{margin-top:24px;border-top:1px solid #ccc;padding-top:8px;font:400 11px/1.6 system-ui;color:#66736d}
      </style></head><body>
      <div class="band">Draft — not an official government form · Prepared with Sahara AI · ${formatDate(new Date().toISOString())}</div>
      <pre>${editedBody.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] ?? c)}</pre>
      <div class="foot">Review every line before submitting. Sahara AI did not submit this document and cannot submit it on your behalf.</div>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const copyDraft = async () => {
    const ok = await copyText(editedBody);
    toast(ok ? 'Draft copied to the clipboard.' : 'Copy failed — select the text and copy manually.', ok ? 'success' : 'warning');
  };

  const saveDraft = () => {
    if (!draft) return;
    const saved: ApplicationDraft = { ...draft, body: editedBody, status: 'saved' };
    try {
      const key = 'sahara.demo.drafts';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as ApplicationDraft[];
      const next = [saved, ...existing.filter((d) => d.id !== saved.id)];
      localStorage.setItem(key, JSON.stringify(next.slice(0, 30)));
      toast('Draft saved to your dashboard (stored in this browser).', 'success');
    } catch {
      toast('The draft could not be saved in this browser. Copy the text instead.', 'warning');
    }
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Application generator"
        title="Prepare an application draft"
        description="Answer a few questions and Sahara AI will write a formal draft you can edit, print or save. The draft is not an official form — you submit it yourself."
        actions={
          <Badge tone="warning" className="h-7">
            Draft only — not an official form
          </Badge>
        }
      />

      <div ref={headingRef} className="mt-6 scroll-mt-20">
        <WizardProgress
          steps={steps}
          current={step}
          maxReachable={maxReachable}
          onStepClick={(index) => {
            if (index < step || maxReachable >= index) goTo(index);
          }}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0 space-y-4">
          {/* Step 1 — department */}
          {step === 0 && (
            <SectionCard title="Which department is the application for?" description="Each department has its own application types and expected details.">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {departments.map((dep) => (
                  <button
                    key={dep}
                    type="button"
                    onClick={() => {
                      setDepartment(dep);
                      setTemplateId('');
                    }}
                    aria-pressed={department === dep}
                    className={cn(
                      'flex items-start gap-2.5 rounded-lg border p-3 text-start transition-colors',
                      department === dep
                        ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-200'
                        : 'border-ink-200 hover:border-brand-300',
                    )}
                  >
                    <Building2 className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-medium text-ink-900">{dep}</span>
                      <span className="mt-0.5 block text-xs text-ink-500">
                        {applicationTemplates.filter((t) => t.department === dep).length} application type(s)
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                <Button
                  type="button"
                  disabled={!department}
                  onClick={() => goTo(1)}
                  trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}
                >
                  Continue
                </Button>
                {!department && <p className="text-xs text-ink-500">Choose a department to continue.</p>}
              </div>
            </SectionCard>
          )}

          {/* Step 2 — type */}
          {step === 1 && (
            <SectionCard title="Choose the application type" description={`Application types for ${department}.`}>
              {templatesForDepartment.length === 0 ? (
                <p className="text-sm text-ink-600">No templates exist for this department yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {templatesForDepartment.map((t: ApplicationTemplate) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      aria-pressed={templateId === t.id}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg border p-3 text-start transition-colors',
                        templateId === t.id
                          ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-200'
                          : 'border-ink-200 hover:border-brand-300',
                      )}
                    >
                      <FileSignature className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium text-ink-900">{t.name}</span>
                          <Badge tone={t.category === 'complaint' ? 'warning' : 'neutral'}>{t.category}</Badge>
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{t.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                <Button type="button" variant="outline" onClick={() => goTo(0)} leadingIcon={<ArrowLeft className="size-4 dir-arrow" aria-hidden="true" />}>
                  Back
                </Button>
                <Button
                  type="button"
                  disabled={!templateId}
                  onClick={() => goTo(2)}
                  trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}
                >
                  Continue
                </Button>
                {!templateId && <p className="text-xs text-ink-500">Choose an application type to continue.</p>}
              </div>
            </SectionCard>
          )}

          {/* Step 3 — details */}
          {step === 2 && template && (
            <SectionCard
              title="Your details"
              description="Only the facts needed for this draft. Leave optional fields blank if you prefer."
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (validateDetails()) goTo(3);
                }}
                noValidate
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {template.fields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : undefined}>
                      <label htmlFor={`f-${field.key}`} className="mb-1.5 block text-sm font-medium text-ink-800">
                        {field.label}
                        {field.required ? (
                          <span className="ms-1 text-red-600" aria-hidden="true">
                            *
                          </span>
                        ) : (
                          <span className="ms-1.5 text-xs font-normal text-ink-500">optional</span>
                        )}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          id={`f-${field.key}`}
                          value={values[field.key] ?? ''}
                          onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          maxLength={field.maxLength}
                          placeholder={field.placeholder}
                          aria-invalid={errors[field.key] ? true : undefined}
                          aria-describedby={errors[field.key] ? `e-${field.key}` : field.help ? `h-${field.key}` : undefined}
                          className={cn(
                            'min-h-28 w-full rounded-lg border px-3 py-2 text-sm',
                            errors[field.key] ? 'border-red-400' : 'border-ink-300',
                          )}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          id={`f-${field.key}`}
                          value={values[field.key] ?? ''}
                          onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          aria-invalid={errors[field.key] ? true : undefined}
                          className={cn(
                            'h-11 w-full rounded-lg border bg-white px-3 text-sm',
                            errors[field.key] ? 'border-red-400' : 'border-ink-300',
                          )}
                        >
                          <option value="">Select…</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`f-${field.key}`}
                          type={field.type}
                          value={values[field.key] ?? ''}
                          onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          maxLength={field.maxLength}
                          placeholder={field.placeholder}
                          aria-invalid={errors[field.key] ? true : undefined}
                          aria-describedby={errors[field.key] ? `e-${field.key}` : field.help ? `h-${field.key}` : undefined}
                          className={cn(
                            'h-11 w-full rounded-lg border px-3 text-sm',
                            errors[field.key] ? 'border-red-400' : 'border-ink-300',
                          )}
                        />
                      )}

                      {field.help && !errors[field.key] && (
                        <p id={`h-${field.key}`} className="mt-1 text-xs text-ink-500">
                          {field.help}
                        </p>
                      )}
                      {errors[field.key] && (
                        <p id={`e-${field.key}`} className="mt-1 text-xs font-medium text-red-700" role="alert">
                          {errors[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => goTo(1)} leadingIcon={<ArrowLeft className="size-4 dir-arrow" aria-hidden="true" />}>
                  Back
                </Button>
                <Button
                  type="submit"
                  trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}
                >
                  Continue
                </Button>
                <p className="text-xs text-ink-500">
                  {Object.keys(errors).length === 0
                    ? 'Nothing is submitted anywhere until you do it yourself at the office.'
                    : `${Object.keys(errors).length} field(s) need attention.`}
                </p>
              </div>
            </form>
          </SectionCard>
          )}

          {/* Step 4 — generate */}
          {step === 3 && template && (
            <SectionCard title="Generate the draft" description="Sahara AI will assemble your answers into a formal letter with the draft label built in.">
              <div className="rounded-lg border border-ink-200 bg-ink-50 p-3">
                <h3 className="text-sm font-semibold text-ink-900">{template.name}</h3>
                <p className="text-xs text-ink-500">{template.department}</p>
                <dl className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
                  {template.fields
                    .filter((f) => values[f.key])
                    .map((f) => (
                      <div key={f.key} className="flex gap-1">
                        <dt className="text-ink-500">{f.label}:</dt>
                        <dd className="truncate font-medium text-ink-800">
                          {f.key === 'details' || f.key === 'request'
                            ? `${values[f.key]!.slice(0, 40)}…`
                            : values[f.key]}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>

              {generateError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                  {generateError}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => goTo(2)} leadingIcon={<ArrowLeft className="size-4 dir-arrow" aria-hidden="true" />}>
                  Edit details
                </Button>
                <Button type="button" onClick={() => void handleGenerate()} loading={generating} leadingIcon={<FileText className="size-4" aria-hidden="true" />}>
                  {generating ? 'Generating…' : 'Generate draft'}
                </Button>
              </div>
            </SectionCard>
          )}

          {/* Step 5 — review/edit */}
          {step === 4 && draft && (
            <SectionCard
              title="Review and edit"
              description="You own this document. Fix anything that does not read correctly — the office will treat it as your own application."
            >
              <label htmlFor="draft-body" className="mb-1.5 block text-sm font-medium text-ink-800">
                Draft text (editable)
              </label>
              <textarea
                id="draft-body"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-brand-900/15 bg-white px-3 py-2.5 font-sans text-sm leading-relaxed"
              />
              <p className="mt-1 text-xs text-ink-500">
                {editedBody.length} characters. The DRAFT label is part of the document and should not be removed.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => goTo(3)} leadingIcon={<ArrowLeft className="size-4 dir-arrow" aria-hidden="true" />}>
                  Back
                </Button>
                <Button type="button" onClick={() => goTo(5)} trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}>
                  Continue to preview
                </Button>
              </div>
            </SectionCard>
          )}

          {/* Step 6 — preview */}
          {step === 5 && draft && (
            <div className="space-y-4">
              <SectionCard title="Preview" description="This is how the printed draft will look.">
                <DraftDocument draft={{ ...draft, body: editedBody }} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={copyDraft} leadingIcon={<Copy className="size-4" aria-hidden="true" />}>
                    Copy text
                  </Button>
                  <Button type="button" variant="outline" onClick={printDraft} leadingIcon={<Printer className="size-4" aria-hidden="true" />}>
                    Print
                  </Button>
                  <Button type="button" variant="outline" onClick={saveDraft} leadingIcon={<Save className="size-4" aria-hidden="true" />}>
                    Save draft
                  </Button>
                  <Button type="button" onClick={() => goTo(6)} trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}>
                    Continue to download
                  </Button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Step 7 — download */}
          {step === 6 && draft && (
            <SectionCard title="Download or print your draft" description="Generate a PDF through your browser's print dialog — choose 'Save as PDF' as the printer.">
              <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
                <h3 className="text-sm font-semibold text-ink-900">{draft.templateName}</h3>
                <p className="text-xs text-ink-500">
                  {draft.department} · Generated {formatDate(draft.createdAt)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-600">
                  The PDF is produced locally by your browser. Nothing is uploaded, and no reference number is
                  created — this is not an official filing.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={printDraft} leadingIcon={<Download className="size-4" aria-hidden="true" />}>
                  Download as PDF
                </Button>
                <Button variant="outline" onClick={copyDraft} leadingIcon={<Copy className="size-4" aria-hidden="true" />}>
                  Copy text
                </Button>
                <Button variant="outline" onClick={saveDraft} leadingIcon={<Save className="size-4" aria-hidden="true" />}>
                  Save to dashboard
                </Button>
              </div>

              <InlineNotice tone="success" title="What happens next" className="mt-4">
                <ol className="ms-4 list-decimal space-y-1">
                  <li>Read the draft once more and correct any detail.</li>
                  <li>Print it, or save it as a PDF from the print dialog.</li>
                  <li>Attach the copies of the documents the office asks for.</li>
                  <li>Submit it yourself at the office and ask for an acknowledgement.</li>
                </ol>
              </InlineNotice>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep(0);
                    setMaxReachable(0);
                    setDraft(null);
                    setValues({});
                    setTemplateId('');
                    setDepartment('');
                    setEditedBody('');
                  }}
                >
                  Start another draft
                </Button>
                <LinkButton to="/dashboard/drafts" variant="ghost">
                  View saved drafts
                </LinkButton>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4">
            <h2 className="text-sm font-semibold text-ink-900">Draft rules</h2>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-ink-600">
              <li className="flex gap-1.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                Every draft carries a “not an official form” label.
              </li>
              <li className="flex gap-1.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                Only the fields needed for the draft are requested.
              </li>
              <li className="flex gap-1.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                Nothing is sent to any office by Sahara AI.
              </li>
              <li className="flex gap-1.5">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-700" aria-hidden="true" />
                Saved drafts stay in this browser until you sign in.
              </li>
            </ul>
          </div>

          {groundedService && (
            <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-brand-800">
                Based on a service record
              </p>
              <h2 className="mt-1 text-sm font-semibold text-ink-900">{groundedService.name}</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                Requirements for this service are listed on its record, with the source and the date checked.
              </p>
              <LinkButton to={`/services/${groundedService.slug}`} variant="outline" size="sm" className="mt-2">
                Open service record
              </LinkButton>
            </div>
          )}

          <InlineNotice tone="warning" title="Keep the label">
            <p>
              Removing the draft label does not make the document official. An office can reject a document that
              presents itself as an official form when it is not.
            </p>
          </InlineNotice>
        </aside>
      </div>
    </div>
  );
}
