import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageReader } from '@/components/common/PageReader';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { renderWithProviders } from '@/test/testUtils';

class Utterance {
  lang = ''; rate = 1; pitch = 1; volume = 1; voice = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;
  text: string;
  constructor(text: string) { this.text = text; }
}
const spoken: Utterance[] = [];
const synth = {
  getVoices: () => [{ lang: 'en-GB', name: 'English', localService: true, default: false }],
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
  speak: vi.fn((u: Utterance) => spoken.push(u)), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(),
  speaking: true, paused: false,
};

beforeEach(() => {
  spoken.length = 0;
  vi.clearAllMocks();
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Page reader', () => {
  it('reads only selected main content and supports stopping', async () => {
    const user = userEvent.setup();
    renderWithProviders(<><PageReader /><main id="main-content"><p>Important service guidance</p></main></>);
    await user.click(screen.getByText('Listen to this page'));
    const p = screen.getByText('Important service guidance');
    const range = document.createRange();
    range.selectNodeContents(p);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    await user.click(screen.getByRole('button', { name: 'Read selected text' }));
    expect(spoken.at(-1)?.text).toBe('Important service guidance');
    expect(screen.getByRole('button', { name: 'Stop reading' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Stop reading' }));
    expect(screen.queryByRole('button', { name: 'Stop reading' })).not.toBeInTheDocument();
    selection.removeAllRanges();
  });

  it('ignores late events from cancelled speech and preserves the new utterance', () => {
    const { result, unmount } = renderHook(() => useSpeechSynthesis());
    act(() => result.current.speak('first', 'en'));
    const first = spoken[0];
    act(() => result.current.speak('second', 'en'));
    const second = spoken[1];
    act(() => first?.onend?.());
    expect(result.current.state).toBe('speaking');
    act(() => second?.onend?.());
    expect(result.current.state).toBe('idle');
    unmount();
  });

  it('does not cancel another component’s speech when an idle reader unmounts', () => {
    const owner = renderHook(() => useSpeechSynthesis());
    const idle = renderHook(() => useSpeechSynthesis());
    act(() => owner.result.current.speak('Hello', 'en'));
    synth.cancel.mockClear();
    idle.unmount();
    expect(synth.cancel).not.toHaveBeenCalled();
    owner.unmount();
  });
});
