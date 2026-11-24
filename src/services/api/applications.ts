/**
 * Application draft generation (maps to POST /api/applications/generate).
 * Drafts are stored locally in demo mode so the citizen dashboard has content;
 * `storage: 'local-demo'` is displayed in the UI so nobody mistakes it for a
 * server-side saved record.
 */
import { templateById } from '@/data/applicationTemplates';
import { demoServices } from '@/data/services';
import { mockRequest } from '@/services/api/client';
import { ApiError, type ApplicationDraft, type GenerateApplicationRequest, type Service } from '@/types/domain';

const STORAGE_KEY = 'sahara.demo.drafts';

function readDrafts(): ApplicationDraft[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ApplicationDraft[]) : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: ApplicationDraft[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* ignore quota errors — draft remains in memory for this session */
  }
}

export function renderDraftBody(request: GenerateApplicationRequest): string {
  const template = templateById(request.templateId);
  if (!template) throw new ApiError(400, 'Unknown application type.', 'unknown_template');

  const missing = template.fields
    .filter((f) => f.required && !request.inputs[f.key]?.trim())
    .map((f) => f.label);

  if (missing.length) {
    throw new ApiError(422, 'Some required information is missing.', 'validation_error');
  }

  const label = (key: string) => template.fields.find((f) => f.key === key)?.label ?? key;
  const value = (key: string) => request.inputs[key]?.trim() ?? '';

  const lines: string[] = [];
  lines.push(template.salutation);
  lines.push('');
  if (value('officeName') || value('policeStation') || value('schoolName') || value('office')) {
    lines.push(value('officeName') || value('policeStation') || value('schoolName') || value('office'));
    lines.push('');
  }
  lines.push(`Subject: ${value('subject') || template.name}`);
  lines.push('');
  lines.push('Respected Sir/Madam,');
  lines.push('');

  for (const section of template.bodySections) {
    const parts = section.fromFields
      .filter((key) => value(key))
      .map((key) => {
        if (key === 'details' || key === 'request') return value(key);
        return `${label(key)}: ${value(key)}`;
      });
    if (parts.length) {
      lines.push(`${section.heading}:`);
      lines.push(parts.join('\n'));
      lines.push('');
    }
  }

  lines.push(template.closing);
  lines.push('');
  lines.push('Sincerely,');
  lines.push('');
  lines.push(value('fullName') || '______________________');
  if (value('cnic')) lines.push(`CNIC: ${value('cnic')}`);
  if (value('contact')) lines.push(`Contact: ${value('contact')}`);
  if (value('address')) lines.push(`Address: ${value('address')}`);
  lines.push('');
  lines.push('Date: ______________________');
  lines.push('');
  lines.push('────────────────────────────────────────────────────────');
  lines.push('DRAFT — NOT AN OFFICIAL GOVERNMENT FORM');
  lines.push('Prepared with Sahara AI from the information you supplied.');
  lines.push('Review every line before submitting it to any office.');
  lines.push('────────────────────────────────────────────────────────');

  return lines.join('\n');
}

export async function generateApplication(request: GenerateApplicationRequest): Promise<ApplicationDraft> {
  const template = templateById(request.templateId);
  const result = await mockRequest(
    () => {
      if (!template) throw new ApiError(400, 'Unknown application type.', 'unknown_template');
      const body = renderDraftBody(request);
      const now = new Date().toISOString();
      const draft: ApplicationDraft = {
        id: `drf-${Math.random().toString(36).slice(2, 9)}`,
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        department: template.department,
        inputs: request.inputs,
        body,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        ownerId: null,
        storage: 'local-demo',
      };
      const drafts = [draft, ...readDrafts()].slice(0, 30);
      writeDrafts(drafts);
      return draft;
    },
    { latency: 700, failureRate: 0.1 },
  );
  if (!result.ok) throw result.error;
  return result.data;
}

export async function listDrafts(): Promise<ApplicationDraft[]> {
  const result = await mockRequest(() => readDrafts(), { latency: 260 });
  if (!result.ok) throw result.error;
  return result.data;
}

export async function updateDraft(id: string, patch: Partial<Pick<ApplicationDraft, 'body' | 'status'>>): Promise<ApplicationDraft> {
  const result = await mockRequest(() => {
    const drafts = readDrafts();
    const index = drafts.findIndex((d) => d.id === id);
    if (index < 0) throw new ApiError(404, 'Draft not found.', 'not_found');
    const updated: ApplicationDraft = { ...drafts[index]!, ...patch, updatedAt: new Date().toISOString() };
    drafts[index] = updated;
    writeDrafts(drafts);
    return updated;
  });
  if (!result.ok) throw result.error;
  return result.data;
}

export async function deleteDraft(id: string): Promise<void> {
  const result = await mockRequest(() => {
    writeDrafts(readDrafts().filter((d) => d.id !== id));
  });
  if (!result.ok) throw result.error;
}

/** The service record a template is grounded in, if any. */
export function groundedService(templateId: string): Service | undefined {
  const template = templateById(templateId);
  if (!template?.serviceId) return undefined;
  return demoServices.find((s) => s.id === template.serviceId);
}
