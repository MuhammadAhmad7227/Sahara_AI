import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/realtime-session.js';

const oldFetch = globalThis.fetch;
const original = { ...process.env };
afterEach(() => { globalThis.fetch = oldFetch; process.env = { ...original }; });
const validCode = 'private-preview-code-with-at-least-32-bytes';
const request = (overrides = {}) => ({
  method: 'POST', headers: { host: 'sahara.test', origin: 'https://sahara.test', 'x-voice-access-code': validCode },
  body: { sdp: 'v=0\r\nexample', language: 'ur' }, ...overrides,
});
const response = () => ({
  headers: {}, statusCode: 0, body: null,
  setHeader(name, value) { this.headers[name] = value; },
  status(code) { this.statusCode = code; return this; },
  json(value) { this.body = value; return this; },
  send(value) { this.body = value; return this; },
});
const configure = () => { process.env.OPENAI_API_KEY = 'server-key-for-test'; process.env.VOICE_ACCESS_CODE = validCode; };

test('fails closed without both server secrets and rejects wrong code and origin', async () => {
  delete process.env.OPENAI_API_KEY; delete process.env.VOICE_ACCESS_CODE;
  let res = response(); await handler(request(), res); assert.equal(res.statusCode, 503);
  configure();
  res = response(); await handler(request({ headers: { host: 'sahara.test', origin: 'https://sahara.test', 'x-voice-access-code': 'wrong' } }), res); assert.equal(res.statusCode, 403);
  res = response(); await handler(request({ headers: { host: 'sahara.test', origin: 'https://attacker.test', 'x-voice-access-code': validCode } }), res); assert.equal(res.statusCode, 403);
  res = response(); await handler(request({ method: 'GET' }), res); assert.equal(res.statusCode, 405);
});

test('validates the SDP and language before contacting the provider', async () => {
  configure(); let called = false; globalThis.fetch = async () => { called = true; };
  for (const body of [{ sdp: 'not sdp', language: 'en' }, { sdp: 'v=0', language: 'other' }, { sdp: 'v=0' + 'x'.repeat(65536), language: 'en' }]) {
    const res = response(); await handler(request({ body }), res); assert.equal(res.statusCode, 400);
  }
  assert.equal(called, false);
});

test('creates a provider session server-side and never returns the API key', async () => {
  configure();
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/realtime/calls');
    assert.equal(options.headers.Authorization, 'Bearer server-key-for-test');
    assert.equal(options.body.get('sdp'), 'v=0\r\nexample');
    const session = JSON.parse(options.body.get('session'));
    assert.equal(session.type, 'realtime');
    assert.match(session.instructions, /Urdu/);
    assert.match(session.instructions, /no access to verified official records/i);
    return new Response('v=0\r\nanswer', { status: 200 });
  };
  const res = response(); await handler(request(), res);
  assert.equal(res.statusCode, 200); assert.equal(res.body, 'v=0\r\nanswer');
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(res.headers['Content-Type'], 'application/sdp');
  assert.doesNotMatch(JSON.stringify(res.body), /server-key-for-test/);
});

test('does not expose provider errors or secrets', async () => {
  configure(); globalThis.fetch = async () => new Response('sensitive upstream text', { status: 401 });
  const res = response(); await handler(request(), res);
  assert.equal(res.statusCode, 502); assert.deepEqual(res.body, { error: 'provider_unavailable' });
});
