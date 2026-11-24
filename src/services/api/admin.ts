/**
 * Admin API surface (map to the protected /api/admin/* routes).
 * Every function here is called behind an admin guard, and the real backend must
 * re-check the role on each request — the guard below is UX only.
 */
import { demoAdminUsers, demoAuditLog, demoFeedback } from '@/data/admin';
import { demoOffices } from '@/data/offices';
import { demoHelplines, demoTollFree } from '@/data/emergency';
import { demoLawyers } from '@/data/lawyers';
import { demoWelfareSchemes } from '@/data/welfare';
import { demoServices } from '@/data/services';
import { mockRequest } from '@/services/api/client';
import {
  ApiError,
  type AdminUserRow,
  type AuditLogEntry,
  type DashboardStats,
  type FeedbackSubmission,
  type ReviewStatus,
  type Service,
} from '@/types/domain';

export async function fetchAdminServices(): Promise<Service[]> {
  const result = await mockRequest(() => [...demoServices].sort((a, b) => a.name.localeCompare(b.name)));
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchAdminService(id: string): Promise<Service> {
  const result = await mockRequest(() => {
    const found = demoServices.find((s) => s.id === id || s.slug === id);
    if (!found) throw new ApiError(404, 'Service not found.', 'not_found');
    return found;
  });
  if (!result.ok) throw result.error;
  return result.data;
}

/**
 * Status transitions available from the admin UI. The demo does not persist
 * admin edits — that requires the backend — so the call reports success of the
 * *simulated* transition and the UI states clearly that it is a demo action.
 */
export async function setServiceStatus(id: string, status: ReviewStatus): Promise<{ id: string; status: ReviewStatus }> {
  const result = await mockRequest(
    () => {
      const found = demoServices.find((s) => s.id === id);
      if (!found) throw new ApiError(404, 'Service not found.', 'not_found');
      return { id, status };
    },
    { latency: 450 },
  );
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const result = await mockRequest(() => ({
    publishedServices: demoServices.filter((s) => s.status === 'published').length,
    pendingReviews: demoServices.filter((s) => s.status === 'pending_review').length,
    sourcesAwaitingReview: demoServices.reduce(
      (n, s) => n + s.sources.filter((src) => src.status === 'pending_review').length,
      0,
    ),
    openFeedback: demoFeedback.filter((f) => f.status !== 'resolved').length,
    activeUsers: demoAdminUsers.filter((u) => u.status === 'active').length,
    staleRecords: demoServices.filter((s) => s.verification === 'outdated' || s.verification === 'demo').length,
  }));
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  const result = await mockRequest(() => demoAuditLog);
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchUsers(): Promise<AdminUserRow[]> {
  const result = await mockRequest(() => demoAdminUsers);
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchFeedback(): Promise<FeedbackSubmission[]> {
  const result = await mockRequest(() => demoFeedback);
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchWelfareAdmin() {
  const result = await mockRequest(() => demoWelfareSchemes);
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchEmergencyAdmin() {
  const result = await mockRequest(() => ({ tollFree: demoTollFree, helplines: demoHelplines }));
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchOfficesAdmin() {
  const result = await mockRequest(() => demoOffices);
  if (!result.ok) throw result.error;
  return result.data;
}

export async function fetchLawyersAdmin() {
  const result = await mockRequest(() => demoLawyers);
  if (!result.ok) throw result.error;
  return result.data;
}

/** Aggregate view for the knowledge-base workflow page. */
export interface KnowledgeRecord {
  id: string;
  service: Service;
  source: Service['sources'][number] | undefined;
  status: ReviewStatus;
}

export async function fetchKnowledgeRecords(): Promise<KnowledgeRecord[]> {
  const result = await mockRequest(() =>
    demoServices.map((service) => ({
      id: `kb-${service.id}`,
      service,
      source: service.sources[0],
      status: service.status,
    })),
  );
  if (!result.ok) throw result.error;
  return result.data;
}
