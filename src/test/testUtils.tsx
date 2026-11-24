import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/common/Feedback';

/** Render a component inside every provider it needs, with a MemoryRouter. */
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    ),
    ...options,
  });
}

/** Render a full page component that may render its own <Routes>. */
export function renderPage(ui: ReactElement, route = '/') {
  return renderWithProviders(ui, { route });
}
