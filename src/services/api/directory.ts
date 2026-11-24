/**
 * Public directory endpoints:
 *  - GET /api/emergency-contacts
 *  - GET /api/offices
 *  - GET /api/lawyers
 *  - GET /api/legal-articles
 * All are read-only in the first release.
 */
import { demoHelplines, demoTollFree } from '@/data/emergency';
import { demoLawyers } from '@/data/lawyers';
import { demoLegalArticles } from '@/data/legal';
import { demoOffices } from '@/data/offices';
import { mockRequest } from '@/services/api/client';
import { ApiError, type EmergencyContact, type Lawyer, type LegalArticle, type PublicOffice } from '@/types/domain';

/* -------------------------------- Emergency ------------------------------- */

export async function listEmergencyContacts(): Promise<{
  tollFree: EmergencyContact[];
  helplines: EmergencyContact[];
}> {
  const result = await mockRequest(() => ({ tollFree: demoTollFree, helplines: demoHelplines }));
  if (!result.ok) throw result.error;
  return result.data;
}

/* --------------------------------- Offices -------------------------------- */

export async function listOffices(query: {
  search?: string;
  category?: PublicOffice['category'] | 'all';
  district?: string | 'all';
} = {}): Promise<PublicOffice[]> {
  const result = await mockRequest(() => {
    const term = query.search?.trim().toLowerCase();
    return demoOffices.filter((o) => {
      if (query.category && query.category !== 'all' && o.category !== query.category) return false;
      if (query.district && query.district !== 'all' && o.district !== query.district) return false;
      if (!term) return true;
      return [o.name, o.city, o.district, o.category].join(' ').toLowerCase().includes(term);
    });
  });
  if (!result.ok) throw result.error;
  return result.data;
}

/* --------------------------------- Lawyers -------------------------------- */

export async function listLawyers(query: {
  search?: string;
  city?: string | 'all';
  specialization?: string | 'all';
} = {}): Promise<Lawyer[]> {
  const result = await mockRequest(() => {
    const term = query.search?.trim().toLowerCase();
    return demoLawyers.filter((l) => {
      if (query.city && query.city !== 'all' && l.city !== query.city) return false;
      if (
        query.specialization &&
        query.specialization !== 'all' &&
        !l.specializations.includes(query.specialization)
      ) {
        return false;
      }
      if (!term) return true;
      return [l.name, l.city, ...l.specializations, l.profileSummary].join(' ').toLowerCase().includes(term);
    });
  });
  if (!result.ok) throw result.error;
  return result.data;
}

/* ------------------------------ Legal articles ---------------------------- */

export async function listLegalArticles(query: {
  search?: string;
  category?: LegalArticle['category'] | 'all';
} = {}): Promise<LegalArticle[]> {
  const result = await mockRequest(() => {
    const term = query.search?.trim().toLowerCase();
    return demoLegalArticles.filter((a) => {
      if (query.category && query.category !== 'all' && a.category !== query.category) return false;
      if (!term) return true;
      return [a.title, a.summary, ...a.body].join(' ').toLowerCase().includes(term);
    });
  });
  if (!result.ok) throw result.error;
  return result.data;
}

export async function getLegalArticle(slug: string): Promise<LegalArticle> {
  const result = await mockRequest(() => {
    const found = demoLegalArticles.find((a) => a.slug === slug);
    if (!found) {
      throw new ApiError(404, 'The requested article could not be found.', 'not_found');
    }
    return found;
  });
  if (!result.ok) throw result.error;
  return result.data;
}
