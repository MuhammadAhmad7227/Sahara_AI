import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function PublicLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>
      <Header />
      {/*
        A page transition, not an animation: a 260ms fade with a 4px rise. The
        key is the pathname, so each navigation re-mounts the wrapper. Under
        prefers-reduced-motion the global rule flattens it to an instant swap.
      */}
      <main id="main-content" className="flex-1">
        <div key={location.pathname} className="animate-slide-up">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
