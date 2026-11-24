import { useCallback } from 'react';
import { storage } from '@/utils/cn';
import type { Service } from '@/types/domain';

const KEY = 'sahara.recentlyViewed';
const LIMIT = 4;

export interface RecentService {
  id: string;
  slug: string;
  name: string;
  department: string;
  viewedAt: string;
}

function read(): RecentService[] {
  return storage.get<RecentService[]>(KEY, []);
}

export function useRecentlyViewed() {
  const items = read();

  const record = useCallback((service: Service) => {
    const entry: RecentService = {
      id: service.id,
      slug: service.slug,
      name: service.name,
      department: service.department,
      viewedAt: new Date().toISOString(),
    };
    const next = [entry, ...read().filter((r) => r.slug !== service.slug)].slice(0, LIMIT);
    storage.set(KEY, next);
  }, []);

  const clear = useCallback(() => storage.remove(KEY), []);

  return { items, record, clear };
}

export function readRecentlyViewed(): RecentService[] {
  return read();
}
