import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import ServiceCataloguePage from '@/pages/public/ServiceCataloguePage';
import ServiceDetailPage from '@/pages/public/ServiceDetailPage';
import { renderWithProviders } from '@/test/testUtils';

function renderCatalogue() {
  return renderWithProviders(
    <Routes>
      <Route path="/services" element={<ServiceCataloguePage />} />
      <Route path="/services/:slug" element={<ServiceDetailPage />} />
    </Routes>,
    { route: '/services' },
  );
}

describe('Service catalogue', () => {
  it('lists services from the mock API', async () => {
    renderCatalogue();
    expect(await screen.findByRole('heading', { name: 'Domicile Certificate' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Electricity Complaint' })).toBeInTheDocument();
  });

  it('filters by search term', async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await screen.findByRole('heading', { name: 'Domicile Certificate' });
    await user.type(screen.getByLabelText(/Search services/i), 'domicile');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Domicile Certificate' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Electricity Complaint' })).not.toBeInTheDocument();
    });
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await screen.findByRole('heading', { name: 'Domicile Certificate' });
    await user.type(screen.getByLabelText(/Search services/i), 'zzzzzz');

    expect(await screen.findByText(/No services match your filters/i)).toBeInTheDocument();
  });

  it('filters by category using the URL', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/services" element={<ServiceCataloguePage />} />
      </Routes>,
      { route: '/services?category=utilities' },
    );

    expect(await screen.findByRole('heading', { name: 'Electricity Complaint' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Domicile Certificate' })).not.toBeInTheDocument();
  });
});

describe('Service detail', () => {
  it('shows requirements, procedure and source provenance', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
      </Routes>,
      { route: '/services/domicile-certificate' },
    );

    expect(await screen.findByRole('heading', { level: 1, name: /Domicile Certificate/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Required documents/i })).toBeInTheDocument();
    expect(screen.getByText(/Copy of Computerised National Identity Card/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Procedure$/ })).toBeInTheDocument();
    expect(screen.getAllByText(/District Administration \(Punjab\)/).length).toBeGreaterThan(0);
    expect(screen.getByText(/URL not recorded yet/i)).toBeInTheDocument();
  });

  it('states that the fee is not verified instead of showing one', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
      </Routes>,
      { route: '/services/domicile-certificate' },
    );

    expect(await screen.findByText(/Fee information not currently verified/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Generate application/i })).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown slug', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
      </Routes>,
      { route: '/services/does-not-exist' },
    );

    expect(await screen.findByText(/Service not found/i)).toBeInTheDocument();
  });
});
