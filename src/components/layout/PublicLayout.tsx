import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
