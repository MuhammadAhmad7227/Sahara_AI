/**
 * Saved services (favourites). Demo mode stores the list locally; a signed-in
 * session would persist it through the backend. The UI labels the storage mode.
 */
import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/utils/cn';

const KEY = 'sahara.savedServices';

export interface SavedService {
  id: string;
  slug: string;
  name: string;
  department: string;
  savedAt: string;
}

export function useSavedServices() {
  const [saved, setSaved] = useState<SavedService[]>(() => storage.get<SavedService[]>(KEY, []));

  useEffect(() => {
    const sync = () => setSaved(storage.get<SavedService[]>(KEY, []));
    window.addEventListener('sahara:saved-changed', sync);
    return () => window.removeEventListener('sahara:saved-changed', sync);
  }, []);

  const isSaved = useCallback((slug: string) => saved.some((s) => s.slug === slug), [saved]);

  const toggle = useCallback((entry: Omit<SavedService, 'savedAt'>) => {
    const current = storage.get<SavedService[]>(KEY, []);
    const exists = current.some((s) => s.slug === entry.slug);
    const next = exists
      ? current.filter((s) => s.slug !== entry.slug)
      : [{ ...entry, savedAt: new Date().toISOString() }, ...current];
    storage.set(KEY, next);
    setSaved(next);
    window.dispatchEvent(new Event('sahara:saved-changed'));
    return !exists;
  }, []);

  return { saved, isSaved, toggle };
}
