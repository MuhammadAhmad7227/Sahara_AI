import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { PageReader } from '@/components/common/PageReader';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

function SkipLink() {
  const { t } = useLanguage();
  return (
    <a href="#main-content" className="sr-only-focusable">
      {t('skip.toContent')}
    </a>
  );
}

export function PublicLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <SkipLink />
      <Header />
      <PageReader />
      {/*
        A page transition, not an animation: a 260ms fade with a 4px rise. The
        key is the pathname, so each navigation re-mounts the wrapper. Under
        prefers-reduced-motion the global rule flattens it to an instant swap.
      */}
      <main id="main-content" tabIndex={-1} className="flex-1">
        <div key={location.pathname} className="animate-slide-up">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
