/**
 * useAsync — one small hook so every data-driven screen exposes the same
 * loading / error / data states without duplicating try/catch boilerplate.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/types/domain';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
  setData: (updater: T | ((current: T | null) => T | null)) => void;
}

export function useAsync<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
  options: { immediate?: boolean } = {},
): AsyncState<T> {
  const { immediate = true } = options;
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!immediate && nonce === 0) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((result) => {
        if (cancelled || !mounted.current) return;
        setDataState(result);
      })
      .catch((err: unknown) => {
        if (cancelled || !mounted.current) return;
        setError(
          err instanceof ApiError
            ? err
            : new ApiError(500, err instanceof Error ? err.message : 'Something went wrong.'),
        );
      })
      .finally(() => {
        if (cancelled || !mounted.current) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, immediate]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const setData = useCallback((updater: T | ((current: T | null) => T | null)) => {
    setDataState((current) =>
      typeof updater === 'function' ? (updater as (c: T | null) => T | null)(current) : updater,
    );
  }, []);

  return { data, loading, error, reload, setData };
}
