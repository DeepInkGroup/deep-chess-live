import { useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
  const seq = useRef(0);

  useEffect(() => {
    const mySeq = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (seq.current === mySeq) setState({ data, error: null, loading: false });
      })
      .catch((error: Error) => {
        if (seq.current === mySeq) setState({ data: null, error, loading: false });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function usePolling<T>(fn: () => Promise<T>, intervalMs: number, deps: React.DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      fn()
        .then((data) => {
          if (!cancelled) setState({ data, error: null, loading: false });
        })
        .catch((error: Error) => {
          if (!cancelled) setState((s) => ({ ...s, error, loading: false }));
        })
        .finally(() => {
          if (!cancelled) timer = setTimeout(tick, intervalMs);
        });
    };
    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
