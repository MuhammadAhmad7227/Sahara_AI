import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { resetMockFailures } from '@/services/api/client';
import { renderWithProviders } from '@/test/testUtils';
import ApplicationGeneratorPage from '@/pages/public/ApplicationGeneratorPage';
import ReadinessPage from '@/pages/public/ReadinessPage';
import ScamDetectorPage from '@/pages/public/ScamDetectorPage';
import { generateApplication, renderDraftBody } from '@/services/api/applications';
import { buildReport } from '@/services/api/readiness';
import { analyzeScam } from '@/services/api/scams';
import { validateFile } from '@/services/api/documents';
import { demoServices } from '@/data/services';

beforeEach(() => resetMockFailures());

/* -------------------------------------------------------------------------- */
/* Application generator                                                      */
/* -------------------------------------------------------------------------- */

describe('Application generator', () => {
  const renderGenerator = () =>
    renderWithProviders(
      <Routes>
        <Route path="/applications" element={<ApplicationGeneratorPage />} />
      </Routes>,
      { route: '/applications' },
    );

  it('blocks step 3 until required details are supplied', async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(await screen.findByRole('button', { name: /Electricity Distribution Company/i }));
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(await screen.findByRole('button', { name: /Electricity complaint/i }));
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    // Submit with an empty form.
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    expect(await screen.findByText(/Full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/What happened|Description of the problem is required/i)).toBeInTheDocument();
  });

  it('generates a draft that carries the DRAFT label', async () => {
    const draft = await generateApplication({
      templateId: 'electricity-complaint',
      inputs: {
        fullName: 'Ayesha Khan',
        address: 'House 4, Burewala',
        contact: '03001234567',
        consumerNumber: '1234567890',
        issueType: 'Power outage',
        incidentDate: '2026-11-01',
        details: 'Supply has been interrupted for three days.',
      },
    });

    expect(draft.storage).toBe('local-demo');
    expect(draft.body).toMatch(/DRAFT — NOT AN OFFICIAL GOVERNMENT FORM/);
    expect(draft.body).toMatch(/Ayesha Khan/);
    const stored = JSON.parse(localStorage.getItem('sahara.demo.drafts') ?? '[]');
    expect(stored[0].templateName).toBe('Electricity complaint');
  });

  it('rejects missing required fields at the API boundary', () => {
    expect(() => renderDraftBody({ templateId: 'electricity-complaint', inputs: {} })).toThrowError(
      /required information is missing|Some required/i,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Readiness checker                                                          */
/* -------------------------------------------------------------------------- */

describe('Readiness checker', () => {
  it('reports a missing mandatory item without claiming acceptance', () => {
    const service = demoServices.find((s) => s.slug === 'domicile-certificate')!;
    const states = Object.fromEntries(
      service.requirements.map((r) => [r.id, r.position === 2 ? 'missing' : 'complete']),
    ) as Record<string, 'complete' | 'missing'>;

    const report = buildReport(service, states);

    expect(report.summary.complete).toBe(service.requirements.length - 1);
    expect(report.summary.mandatoryMissing).toBe(1);
    expect(report.statement).toMatch(/appears to be missing/i);
    expect(report.statement).toMatch(/confirm the latest requirements/i);
    expect(report.statement).not.toMatch(/will be accepted/i);
  });

  it('renders the three-way checklist and a summary', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/readiness" element={<ReadinessPage />} />
      </Routes>,
      { route: '/readiness?service=domicile-certificate' },
    );

    expect(await screen.findByText(/Copy of Computerised National Identity Card/i)).toBeInTheDocument();

    const firstItem = screen.getByRole('group', { name: /Status for Copy of Computerised National Identity Card/i });
    await user.click(within(firstItem).getByRole('button', { name: /Complete/i }));

    await user.click(screen.getByRole('button', { name: /Check readiness/i }));

    expect(await screen.findByText(/of .* required items completed/i, {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText(/confirm the latest requirements with the relevant authority/i)).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* Scam detector                                                              */
/* -------------------------------------------------------------------------- */

describe('Scam detector', () => {
  it('flags an OTP + urgency message as high concern', async () => {
    const analysis = await analyzeScam(
      'Dear customer, your account will be blocked within 2 hours. Share the OTP you received to re-verify your CNIC.',
    );

    expect(analysis.riskLevel).toBe('high_concern');
    expect(analysis.indicators.map((i) => i.id)).toEqual(expect.arrayContaining(['otp_request', 'urgency']));
    expect(analysis.disclaimer).toMatch(/not definitive proof of fraud/i);
    expect(analysis.safetyAdvice.join(' ')).toMatch(/OTP/i);
  });

  it('returns low concern for a neutral message but still warns that it is not proof', async () => {
    const analysis = await analyzeScam('Please collect your parcel from the post office counter on Monday.');
    expect(analysis.riskLevel).toBe('low_concern');
    expect(analysis.indicators).toHaveLength(0);
    expect(analysis.explanation).toMatch(/does not make a message safe/i);
  });

  it('validates attached files before analysis', () => {
    const bad = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    expect(validateFile(bad)).toMatch(/Unsupported file type/i);

    const big = new File([new Uint8Array(11 * 1024 * 1024)], 'scan.pdf', { type: 'application/pdf' });
    expect(validateFile(big)).toMatch(/maximum size is 10 MB/i);

    const good = new File(['x'], 'scan.png', { type: 'image/png' });
    expect(validateFile(good)).toBeNull();
  });

  it('shows the result section in the UI after analysis', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/scam-detector" element={<ScamDetectorPage />} />
      </Routes>,
      { route: '/scam-detector' },
    );

    await user.type(
      screen.getByLabelText(/Message text/i),
      'Congratulations! You won a prize. Send your card number and OTP immediately to claim.',
    );
    await user.click(screen.getByRole('button', { name: /Analyze message/i }));

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /High concern/i })).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(screen.getByText(/Detected indicators/i)).toBeInTheDocument();
    expect(screen.getByText(/What to do now/i)).toBeInTheDocument();
  });
});
