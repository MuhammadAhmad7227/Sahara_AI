/**
 * API transport for Sahara AI.
 *
 * Today: a typed in-browser mock transport (demo mode).
 * Later:  set VITE_API_BASE_URL and `mode` becomes 'http'; the same functions in
 *         `src/services/api/*` will then call the FastAPI backend. No component
 *         imports a mock directly — everything goes through this layer.
 *
 * Contract notes for backend integration:
 *  - Every call returns `ApiResult<T>`; failures carry an `ApiError` with a
 *    status code so the UI can pick the correct message (see errors.ts).
 *  - The mock adds realistic latency and occasional, *opt-in* failures so that
 *    loading and error states can be reviewed without faking success.
 */
import { ApiError, type ApiResult } from '@/types/domain';

const env = import.meta.env as Record<string, string | undefined>;

export const apiConfig = {
  /** Empty string ⇒ demo/mock mode. */
  baseUrl: env.VITE_API_BASE_URL ?? '',
  /** Set to "false" in .env to disable demo latency during testing. */
  simulateLatency: env.VITE_API_SIMULATE_LATENCY !== 'false',
  /** Set to "true" to exercise error states in a demo review. */
  simulateFailures: env.VITE_API_SIMULATE_FAILURES === 'true',
  mode: (env.VITE_API_BASE_URL ? 'http' : 'mock') as 'http' | 'mock',
} as const;

const DEFAULT_LATENCY = { min: 220, max: 620 };

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function randomLatency(): number {
  const { min, max } = DEFAULT_LATENCY;
  return Math.round(min + Math.random() * (max - min));
}

/** Simulated failure used only when VITE_API_SIMULATE_FAILURES=true. */
class SimulatedNetworkError extends Error {}

/**
 * Test-only failure control. Tests can force the next N mock requests to fail so
 * that error states are exercised deterministically. It is never used by the
 * application itself.
 */
let forcedFailures = 0;

export function failNextMockRequests(count = 1): void {
  forcedFailures = count;
}

export function resetMockFailures(): void {
  forcedFailures = 0;
}

/**
 * Execute a mock resolver with the same envelope, latency and error semantics
 * as the future HTTP client. `failureRate` lets a specific endpoint be made
 * flaky on purpose for demonstration, but only when explicitly enabled.
 */
export async function mockRequest<T>(
  resolver: () => T,
  options: { latency?: number; failureRate?: number } = {},
): Promise<ApiResult<T>> {
  try {
    const latency = apiConfig.simulateLatency ? (options.latency ?? randomLatency()) : 0;
    if (latency > 0) await delay(latency);

    if (forcedFailures > 0) {
      forcedFailures -= 1;
      throw new SimulatedNetworkError('Forced failure (test)');
    }

    const failureRate = apiConfig.simulateFailures ? (options.failureRate ?? 0.12) : 0;
    if (failureRate > 0 && Math.random() < failureRate) {
      throw new SimulatedNetworkError('Simulated network failure (demo mode)');
    }

    return { ok: true, data: resolver() };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error };
    }
    if (error instanceof SimulatedNetworkError) {
      return { ok: false, error: new ApiError(0, 'Unable to connect to Sahara AI. Please check your connection.', 'network_error') };
    }
    return {
      ok: false,
      error: new ApiError(500, 'Something went wrong. Please try again.', 'internal_error'),
    };
  }
}

/**
 * HTTP request helper, ready for the FastAPI backend.
 * Unused while mode === 'mock', which keeps the production bundle honest:
 * no endpoint is contacted that does not exist yet.
 */
export async function httpRequest<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<ApiResult<T>> {
  const { timeoutMs = 20_000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiConfig.baseUrl}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...rest.headers,
      },
      credentials: 'include',
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
      return {
        ok: false,
        error: new ApiError(
          response.status,
          payload?.detail ?? response.statusText,
          payload?.code,
          payload?.fieldErrors,
        ),
      };
    }
    return { ok: true, data: payload as T };
  } catch {
    return {
      ok: false,
      error: new ApiError(0, 'Unable to connect to Sahara AI. Please check your connection.', 'network_error'),
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Unwrap a result for callers that prefer exceptions (e.g. query hooks). */
export function unwrap<T>(result: ApiResult<T>): T {
  if (!result.ok) throw result.error;
  return result.data;
}
