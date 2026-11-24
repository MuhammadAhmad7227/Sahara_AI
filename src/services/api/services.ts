/**
 * Public service catalogue API (maps to GET /api/services and /api/services/{id}).
 * In demo mode it filters the typed demo catalogue in-memory; the signatures and
 * result shapes match the planned backend contract exactly.
 */
import { demoServices, departments } from '@/data/services';
import { mockRequest } from '@/services/api/client';
import { ApiError, type Paginated, type Service, type ServiceListQuery } from '@/types/domain';

function matches(service: Service, q: ServiceListQuery): boolean {
  if (q.category && q.category !== 'all' && service.category !== q.category) return false;
  if (q.department && q.department !== 'all' && service.department !== q.department) return false;
  if (q.jurisdiction && q.jurisdiction !== 'all' && service.jurisdiction !== q.jurisdiction) return false;
  if (q.popularOnly && !service.popular) return false;

  const term = q.search?.trim().toLowerCase();
  if (!term) return true;

  const haystack = [
    service.name,
    service.nameUr ?? '',
    service.department,
    service.shortDescription,
    service.description,
    service.category,
    ...service.tags,
  ]
    .join(' ')
    .toLowerCase();

  return term.split(/\s+/).every((word) => haystack.includes(word));
}

/**
 * Public catalogue only exposes records a citizen may see. Drafts are hidden;
 * approved and pending-review records are visible but flagged in the UI.
 */
const visible = demoServices.filter((s) => s.status !== 'draft' && s.status !== 'rejected');

export async function listServices(query: ServiceListQuery = {}): Promise<Paginated<Service>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 9));

  const result = await mockRequest(() => {
    let items = visible.filter((s) => matches(s, query));

    switch (query.sort) {
      case 'name':
        items = [...items].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recently_verified':
        items = [...items].sort((a, b) => (b.lastVerifiedAt ?? '').localeCompare(a.lastVerifiedAt ?? ''));
        break;
      default:
        items = [...items].sort((a, b) => {
          if (Boolean(b.popular) !== Boolean(a.popular)) return Number(b.popular) - Number(a.popular);
          return a.name.localeCompare(b.name);
        });
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;

    return {
      items: items.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages,
    } satisfies Paginated<Service>;
  });

  if (!result.ok) throw result.error;
  return result.data;
}

export async function getServiceBySlug(slug: string): Promise<Service> {
  const result = await mockRequest(() => {
    const found = demoServices.find((s) => s.slug === slug);
    if (!found) throw new ApiError(404, 'The requested service could not be found.', 'not_found');
    return found;
  });
  if (!result.ok) throw result.error;
  return result.data;
}

export async function getPopularServices(limit = 4): Promise<Service[]> {
  const result = await mockRequest(() =>
    visible
      .filter((s) => s.popular)
      .slice(0, limit),
  );
  if (!result.ok) throw result.error;
  return result.data;
}

export async function getRelatedServices(service: Service, limit = 3): Promise<Service[]> {
  const result = await mockRequest(() =>
    visible
      .filter((s) => s.id !== service.id && (s.category === service.category || s.department === service.department))
      .slice(0, limit),
  );
  if (!result.ok) throw result.error;
  return result.data;
}

export function getDepartments(): string[] {
  return departments;
}
