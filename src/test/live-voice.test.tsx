import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiveVoice } from '@/components/assistant/LiveVoice';
import { renderWithProviders } from '@/test/testUtils';

const track = { enabled: true, stop: vi.fn() };
const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
let peer: FakePeer;
class FakePeer {
  connectionState = 'new';
  localDescription: { sdp: string } | null = null;
  onconnectionstatechange: (() => void) | null = null;
  ontrack = null;
  close = vi.fn();
  addTrack = vi.fn();
  constructor() { peer = this; }
  createDataChannel() { return { onmessage: null }; }
  async createOffer() { return { type: 'offer', sdp: 'v=0\r\noffer' }; }
  async setLocalDescription(offer: { sdp: string }) { this.localDescription = offer; }
  async setRemoteDescription() {}
}
const getUserMedia = vi.fn();

beforeEach(() => {
  track.enabled = true; vi.clearAllMocks();
  getUserMedia.mockResolvedValue(stream);
  vi.stubGlobal('RTCPeerConnection', FakePeer);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('v=0\r\nanswer', { status: 200, headers: { 'content-type': 'application/sdp' } })));
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); delete (navigator as unknown as { mediaDevices?: unknown }).mediaDevices; });

describe('Live voice preview', () => {
  it('starts a gated session, mutes the microphone and releases resources', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveVoice />);
    await user.type(screen.getByLabelText('Voice preview access code'), 'my-preview-code');
    await user.click(screen.getByRole('button', { name: 'Start voice conversation' }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith('/api/realtime-session', expect.objectContaining({ method: 'POST' }));
    await act(async () => { peer.connectionState = 'connected'; peer.onconnectionstatechange?.(); });
    expect(screen.getByText(/Connected. Speak naturally/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mute microphone' }));
    expect(track.enabled).toBe(false);
    await user.click(screen.getByRole('button', { name: 'End conversation' }));
    expect(track.stop).toHaveBeenCalled();
    expect(peer.close).toHaveBeenCalled();
    expect(screen.getByLabelText('Voice preview access code')).toHaveValue('');
  });

  it('stops the microphone and explains when the backend is not configured', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ error: 'not_configured' }), { status: 503, headers: { 'content-type': 'application/json' } }));
    const user = userEvent.setup();
    renderWithProviders(<LiveVoice />);
    await user.type(screen.getByLabelText('Voice preview access code'), 'test-code');
    await user.click(screen.getByRole('button', { name: 'Start voice conversation' }));
    expect(await screen.findByText(/not configured on the server/i)).toBeInTheDocument();
    expect(track.stop).toHaveBeenCalled();
    expect(peer.close).toHaveBeenCalled();
  });

  it('releases a microphone granted after the user cancels connection', async () => {
    let grant: (value: typeof stream) => void = () => {};
    getUserMedia.mockReturnValue(new Promise((resolve) => { grant = resolve; }));
    const user = userEvent.setup();
    renderWithProviders(<LiveVoice />);
    await user.type(screen.getByLabelText('Voice preview access code'), 'test-code');
    await user.click(screen.getByRole('button', { name: 'Start voice conversation' }));
    await user.click(screen.getByRole('button', { name: 'End conversation' }));
    await act(async () => { grant(stream); });
    expect(track.stop).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
