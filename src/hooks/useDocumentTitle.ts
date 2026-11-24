import { useEffect } from 'react';

/** Sets the page title and meta description for SEO on public pages. */
export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title.includes('Sahara AI') ? title : `${title} · Sahara AI`;

    let metaEl: HTMLMetaElement | null = null;
    let previousDescription: string | null = null;
    if (description) {
      metaEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.name = 'description';
        document.head.appendChild(metaEl);
      }
      previousDescription = metaEl.content;
      metaEl.content = description;
    }

    return () => {
      document.title = previousTitle;
      if (metaEl && previousDescription !== null) metaEl.content = previousDescription;
    };
  }, [title, description]);
}
