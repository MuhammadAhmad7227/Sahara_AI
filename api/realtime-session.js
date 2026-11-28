import { timingSafeEqual } from 'node:crypto';

// Demo accounts are client-side only; never treat them as authentication here.
// This gate is an interim private-preview control, not public-production auth.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const fail = (status, error) => res.status(status).json({ error });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(405, 'method_not_allowed');
  }
  const key = process.env.OPENAI_API_KEY;
  const code = process.env.VOICE_ACCESS_CODE;
  if (!key || !code || Buffer.byteLength(code) < 32) return fail(503, 'not_configured');
  const provided = typeof req.headers['x-voice-access-code'] === 'string' ? req.headers['x-voice-access-code'] : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(code);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail(403, 'access_denied');

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (typeof origin !== 'string' || typeof host !== 'string') return fail(403, 'invalid_origin');
  try {
    const parsed = new URL(origin);
    if (parsed.host !== host || !['https:', 'http:'].includes(parsed.protocol)) return fail(403, 'invalid_origin');
  } catch { return fail(403, 'invalid_origin'); }

  const { sdp, language } = req.body && typeof req.body === 'object' ? req.body : {};
  if (typeof sdp !== 'string' || !sdp.startsWith('v=0') || Buffer.byteLength(sdp) > 65536 || !['en', 'ur', 'pa'].includes(language)) {
    return fail(400, 'invalid_request');
  }
  const languages = { en: 'English', ur: 'Urdu', pa: 'Punjabi (Shahmukhi)' };
  const session = {
    type: 'realtime',
    model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1',
    instructions: `You are Sahara AI, an independent civic information assistant, not a government service. Respond naturally in ${languages[language]} by default, and accommodate a different language if requested. Be concise, clear and empathetic. You have no access to verified official records, current fees, deadlines, eligibility, live government databases, or web browsing. Never invent or assert those details as verified, never claim to have checked a source, and never imply you can submit applications. Explain uncertainty and advise the user to confirm important details with the relevant official office using independently obtained contact details. The site's records are unverified demonstration data. Do not request passwords, OTPs, PINs, bank details, or other secrets. Do not provide definitive legal, medical, or fraud verdicts.`,
    audio: { output: { voice: 'marin' } },
  };
  const form = new FormData();
  form.set('sdp', sdp);
  form.set('session', JSON.stringify(session));
  try {
    const upstream = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(25000),
    });
    if (!upstream.ok) return fail(502, 'provider_unavailable');
    const answer = await upstream.text();
    if (!answer.startsWith('v=0') || answer.length > 65536) return fail(502, 'provider_unavailable');
    res.setHeader('Content-Type', 'application/sdp');
    return res.status(200).send(answer);
  } catch {
    return fail(502, 'provider_unavailable');
  }
}
