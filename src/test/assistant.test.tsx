import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetMockFailures, failNextMockRequests } from '@/services/api/client';
import { askAssistant } from '@/services/api/assistant';
import AssistantPage from '@/pages/public/AssistantPage';
import { renderWithProviders } from '@/test/testUtils';

beforeEach(() => resetMockFailures());
afterEach(() => resetMockFailures());

describe('Assistant API (grounding behaviour)', () => {
  it('answers a domicile question from the stored record and cites its source', async () => {
    const answer = await askAssistant({ question: 'Mujhe domicile banwana hai, kya documents chahiye?', language: 'en' });

    expect(answer.noReliableRecord).toBe(false);
    expect(answer.answer).toMatch(/Domicile Certificate/);
    expect(answer.answer).toMatch(/Proof of residence/);
    expect(answer.sources).toHaveLength(1);
    expect(answer.sources[0]?.publisher).toMatch(/District Administration/);
    // The demo must not invent a fee.
    expect(answer.answer).toMatch(/Fee information is not currently verified/);
  });

  it('refuses to answer when no reviewed record matches', async () => {
    const answer = await askAssistant({ question: 'What is the weather in Lahore tomorrow?', language: 'en' });

    expect(answer.noReliableRecord).toBe(true);
    expect(answer.sources).toHaveLength(0);
    expect(answer.intent).toBe('out_of_scope');
  });

  it('returns an error result when the transport fails', async () => {
    failNextMockRequests(1);
    await expect(askAssistant({ question: 'domicile documents', language: 'en' })).rejects.toThrow();
  });
});

describe('Assistant page', () => {
  it('submits a suggested question and renders the answer with its source block', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssistantPage />, { route: '/assistant' });

    const suggestion = await screen.findByRole('button', { name: /Mujhe domicile banwana hai/i });
    await user.click(suggestion);

    // The user's turn is echoed immediately.
    expect(await screen.findByText(/Mujhe domicile banwana hai/i)).toBeInTheDocument();

    // The answer and its provenance arrive after the mock latency.
    expect(await screen.findByText(/Source information used/i, {}, { timeout: 4000 })).toBeInTheDocument();
    // The "AI explanation" label appears both in the answer and in the side panel.
    expect(screen.getAllByText(/AI explanation/i).length).toBeGreaterThan(0);
    // The grounding rule is stated next to the answer, not just in the footer.
    expect(screen.getAllByText(/reviewed public sources|does not use unreviewed/i).length).toBeGreaterThan(0);
  });

  it('renders an error state with a retry action and keeps other tools available', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssistantPage />, { route: '/assistant' });

    await screen.findByRole('button', { name: /How can I prepare an electricity complaint/i });
    failNextMockRequests(1);

    await user.click(screen.getByRole('button', { name: /How can I prepare an electricity complaint/i }));

    expect(await screen.findByText(/The assistant could not answer/i, {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });
});

describe('Assistant error copy', () => {
  it('maps an auth error to a login prompt', async () => {
    const { errorMessage } = await import('@/services/api/errors');
    const { ApiError } = await import('@/types/domain');
    expect(errorMessage(new ApiError(401, 'Unauthorized'))).toBe('Please log in to continue.');
    expect(errorMessage(new ApiError(401, 'Unauthorized', 'invalid_credentials'))).toBe(
      'The email or password you entered is not correct.',
    );
    expect(errorMessage(new ApiError(500, 'boom'))).toBe('Something went wrong. Please try again.');
  });
});

// Ensure waitFor defaults do not hide slow states in CI.
vi.setConfig({ testTimeout: 15_000 });
