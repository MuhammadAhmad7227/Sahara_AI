import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScamDetectorPage from '@/pages/public/ScamDetectorPage';
import { extractScamImageText } from '@/services/api/scamImage';
import { analyzeScam } from '@/services/api/scams';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('@/services/api/scamImage', () => ({ extractScamImageText: vi.fn() }));
const extract = vi.mocked(extractScamImageText);

beforeEach(() => extract.mockReset());

describe('Screenshot scam scan', () => {
  it('scans screenshot text together with the typed message', async () => {
    extract.mockResolvedValue('Send your OTP immediately');
    const user = userEvent.setup();
    renderWithProviders(<ScamDetectorPage />);
    await user.type(screen.getByLabelText('Message text'), 'Please check this message');
    const image = new File(['image'], 'message.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Attach a screenshot'), image);
    await user.click(screen.getByRole('button', { name: 'Analyze message' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'High concern' })).toBeInTheDocument());
    expect(extract).toHaveBeenCalledWith(image);
    expect(screen.getByText('Send your OTP immediately')).toBeInTheDocument();
    expect(screen.getByText('Asks for an OTP, PIN or password')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Message text'), ' updated');
    expect(screen.queryByRole('heading', { name: 'High concern' })).not.toBeInTheDocument();
  });

  it('allows image-only scans and does not issue a text-only result when OCR fails', async () => {
    extract.mockResolvedValue('');
    const user = userEvent.setup();
    renderWithProviders(<ScamDetectorPage />);
    await user.upload(screen.getByLabelText('Attach a screenshot'), new File(['x'], 'blank.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: 'Analyze message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No text could be read');
    expect(screen.queryByText('Risk level')).not.toBeInTheDocument();
  });

  it('flags Urdu indicators without ASCII word-boundary errors', async () => {
    const result = await analyzeScam('فوراً اپنا او ٹی پی بھیجیں');
    expect(result.indicators.map((item) => item.id)).toEqual(expect.arrayContaining(['otp_request', 'urgency']));
  });
});
