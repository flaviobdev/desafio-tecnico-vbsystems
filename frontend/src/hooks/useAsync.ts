import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../lib/api-client';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) =>
        setState({
          data: null,
          loading: false,
          error: err instanceof ApiError ? err.message : 'Não foi possível carregar os dados.',
        }),
      );
  }, [...deps, tick]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
