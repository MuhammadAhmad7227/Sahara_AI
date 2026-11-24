/**
 * Readiness checker (maps to POST /api/applications/check-readiness).
 * Compares the citizen's checklist answers with the stored requirements and
 * produces the three-category report. It never claims an application will be
 * accepted — see `buildStatement`.
 */
import { demoServices } from '@/data/services';
import { mockRequest } from '@/services/api/client';
import {
  ApiError,
  type ReadinessItem,
  type ReadinessItemState,
  type ReadinessReport,
  type Service,
} from '@/types/domain';

export function buildReport(
  service: Service,
  states: Record<string, ReadinessItemState>,
): ReadinessReport {
  const items: ReadinessItem[] = [...service.requirements]
    .sort((a, b) => a.position - b.position)
    .map((req) => ({
      requirementId: req.id,
      title: req.title,
      details: req.details,
      mandatory: req.mandatory,
      state: states[req.id] ?? 'missing',
    }));

  const complete = items.filter((i) => i.state === 'complete').length;
  const missing = items.filter((i) => i.state === 'missing').length;
  const needsReview = items.filter((i) => i.state === 'needs_review').length;
  const mandatoryMissing = items.filter((i) => i.mandatory && i.state !== 'complete').length;

  const statement =
    mandatoryMissing === 0 && needsReview === 0
      ? 'Every required item in the stored checklist is marked complete. This does not guarantee acceptance — confirm the latest requirements with the relevant authority before you travel.'
      : mandatoryMissing === 0
        ? `All mandatory items are marked complete, and ${needsReview} item${needsReview === 1 ? '' : 's'} should be reviewed before submission. Confirm the latest requirements with the relevant authority.`
        : `Based on the currently stored checklist, ${mandatoryMissing} required item${mandatoryMissing === 1 ? '' : 's'} appears to be missing or incomplete. Please confirm the latest requirements with the relevant authority.`;

  return {
    serviceId: service.id,
    serviceName: service.name,
    items,
    generatedAt: new Date().toISOString(),
    summary: {
      total: items.length,
      complete,
      missing,
      needsReview,
      mandatoryMissing,
    },
    statement,
  };
}

export async function checkReadiness(
  serviceSlug: string,
  states: Record<string, ReadinessItemState>,
): Promise<ReadinessReport> {
  const result = await mockRequest(
    () => {
      const service = demoServices.find((s) => s.slug === serviceSlug);
      if (!service) throw new ApiError(404, 'Service not found.', 'not_found');
      return buildReport(service, states);
    },
    { latency: 600, failureRate: 0.08 },
  );
  if (!result.ok) throw result.error;
  return result.data;
}
