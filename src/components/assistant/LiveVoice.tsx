import { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/common/Button';
import type { TranslationKey } from '@/i18n';

type Status = 'idle' | 'connecting' | 'connected';
type Resources = { peer: RTCPeerConnection | null; stream: MediaStream | null; abort: AbortController; timer: number | null };

/** A separate, opt-in OpenAI voice session; it does not use the demo assistant. */
export function LiveVoice() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<Status>('idle');
  const [code, setCode] = useState('');
  const [muted, setMuted] = useState(false);
  const [message, setMessage] = useState<TranslationKey | null>(null);
  const resources = useRef<Resources | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const cleanup = useCallback(() => {
    const r = resources.current;
    resources.current = null;
    if (!r) return;
    r.abort.abort();
    if (r.timer !== null) window.clearTimeout(r.timer);
    r.stream?.getTracks().forEach((track) => track.stop());
    if (r.peer) { r.peer.onconnectionstatechange = null; r.peer.ontrack = null; r.peer.close(); }
    if (audioRef.current) audioRef.current.srcObject = null;
  }, []);

  const end = useCallback((notice?: TranslationKey) => {
    cleanup();
    setStatus('idle');
    setMuted(false);
    setCode('');
    setMessage(notice ?? null);
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);
  // A new language requires a new session, rather than silently keeping old instructions.
  useEffect(() => { end(); }, [language, end]);

  const start = async () => {
    if (resources.current || !code.trim()) return;
    setMessage(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined') {
      setMessage('live.unsupported'); return;
    }
    const r: Resources = { peer: null, stream: null, abort: new AbortController(), timer: null };
    resources.current = r;
    setStatus('connecting');
    // Also bounds a stalled permission prompt or connection setup.
    r.timer = window.setTimeout(() => { if (resources.current === r) end('live.timeout'); }, 45000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (resources.current !== r) { stream.getTracks().forEach((track) => track.stop()); return; }
      r.stream = stream;
      const peer = new RTCPeerConnection();
      r.peer = peer;
      peer.ontrack = (event) => {
        if (resources.current !== r || !audioRef.current || !event.streams[0]) return;
        audioRef.current.srcObject = event.streams[0];
        void audioRef.current.play().catch(() => { if (resources.current === r) setMessage('live.playAudio'); });
      };
      peer.onconnectionstatechange = () => {
        if (resources.current !== r) return;
        if (peer.connectionState === 'connected') {
          if (r.timer !== null) window.clearTimeout(r.timer);
          r.timer = window.setTimeout(() => { if (resources.current === r) end('live.limit'); }, 5 * 60 * 1000);
          setStatus('connected');
        } else if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected' || peer.connectionState === 'closed') end('live.disconnected');
      };
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      const channel = peer.createDataChannel('oai-events');
      channel.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as { type?: string };
          if (payload.type === 'error' && resources.current === r) end('live.disconnected');
        } catch { /* Ignore malformed provider events. */ }
      };
      const offer = await peer.createOffer();
      if (resources.current !== r) return;
      await peer.setLocalDescription(offer);
      if (resources.current !== r) return;
      const response = await fetch('/api/realtime-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Voice-Access-Code': code },
        body: JSON.stringify({ sdp: peer.localDescription?.sdp, language }),
        signal: r.abort.signal,
      });
      if (resources.current !== r) return;
      setCode('');
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        if (resources.current !== r) return;
        end(data.error === 'not_configured' ? 'live.notConfigured' : data.error === 'access_denied' ? 'live.accessDenied' : 'live.failed');
        return;
      }
      if (!response.headers.get('content-type')?.includes('application/sdp')) { end('live.failed'); return; }
      const answer = await response.text();
      if (resources.current !== r) return;
      await peer.setRemoteDescription({ type: 'answer', sdp: answer });
      if (resources.current !== r) return;
    } catch (error) {
      if (resources.current !== r) return;
      end(error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'NotFoundError') ? 'live.microphoneError' : 'live.failed');
    }
  };

  const toggleMute = () => {
    const track = resources.current?.stream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  return (
    <section className="rounded-2xl border border-brand-900/10 bg-white p-4 shadow-1 sm:p-5" aria-labelledby="live-voice-heading">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800"><Headphones className="size-5" aria-hidden="true" /></span>
        <div><h2 id="live-voice-heading" className="font-semibold text-ink-950">{t('live.title')}</h2><p dir="auto" className="mt-1 text-sm leading-relaxed text-ink-600">{t('live.description')}</p></div>
      </div>
      <p dir="auto" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">{t('live.notice')}</p>
      {status === 'idle' && <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 text-xs font-medium text-ink-700">{t('live.code')}
          <input type="password" autoComplete="off" maxLength={256} value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm" />
        </label>
        <Button onClick={() => void start()} disabled={!code.trim()} leadingIcon={<Mic className="size-4" aria-hidden="true" />}>{t('live.start')}</Button>
      </div>}
      {status !== 'idle' && <div className="mt-3 flex flex-wrap items-center gap-2">
        {status === 'connected' && <Button variant="outline" onClick={toggleMute} aria-pressed={muted} leadingIcon={muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}>{t(muted ? 'live.unmute' : 'live.mute')}</Button>}
        <Button variant="outline" onClick={() => end()} leadingIcon={<PhoneOff className="size-4" />}>{t('live.end')}</Button>
      </div>}
      <p role="status" dir="auto" className="mt-2 text-xs leading-relaxed text-ink-600">{message ? t(message) : t(status === 'connected' ? 'live.connected' : status === 'connecting' ? 'live.connecting' : 'live.idle')}</p>
      <audio ref={audioRef} autoPlay controls className={status === 'connected' ? 'mt-2 max-w-full' : 'hidden'} aria-label={t('live.audio')} />
    </section>
  );
}
