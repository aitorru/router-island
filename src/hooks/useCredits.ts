import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchBalance, OpenRouterError, type CreditsSnapshot } from '../openrouter';
import { setSharedSnapshot } from '../sharedDefaults';

interface UseCreditsState {
  snapshot: CreditsSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches the OpenRouter balance for the given API key and keeps the App Group
 * snapshot mirror in sync. Re-fetches whenever the key changes.
 */
export function useCredits(apiKey: string | null): UseCreditsState {
  const [snapshot, setSnapshot] = useState<CreditsSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    if (!apiKey) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    fetchBalance(apiKey, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        setSnapshot(next);
        setSharedSnapshot(next);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof OpenRouterError
            ? err.message
            : `Unexpected error: ${(err as Error).message}`,
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [apiKey]);

  useEffect(() => {
    // Intentional fetch-on-mount / on-key-change; the loading state this sets
    // is exactly the external sync this effect exists for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}
