import { OPENROUTER_BASE_URL } from './constants';

/**
 * Normalized view of an OpenRouter balance, regardless of which endpoint we
 * managed to read it from. Amounts are in credits, where 1 credit === 1 USD.
 */
export interface CreditsSnapshot {
  /** Credits left, or null when the key is unlimited and we can't infer a balance. */
  remaining: number | null;
  /** Credits already spent. */
  used: number;
  /** Total credits available (purchased), or null when unknown. */
  total: number | null;
  isFreeTier: boolean;
  /** Which endpoint produced this snapshot. */
  source: 'credits' | 'key';
  /** Epoch milliseconds when this snapshot was fetched. */
  fetchedAt: number;
  label?: string;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

interface CreditsResponse {
  data?: { total_credits?: number; total_usage?: number };
}

interface KeyResponse {
  data?: {
    label?: string;
    usage?: number;
    limit?: number | null;
    is_free_tier?: boolean;
  };
}

async function get<T>(path: string, apiKey: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${OPENROUTER_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    });
  } catch (err) {
    throw new OpenRouterError(
      `Network error reaching OpenRouter: ${(err as Error).message}`,
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      // ignore body read failures
    }
    throw new OpenRouterError(
      `OpenRouter ${path} returned ${res.status}${detail ? `: ${detail}` : ''}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

/**
 * Account-wide balance via `GET /credits`. Returns the true remaining balance
 * (`total_credits - total_usage`). This endpoint may require a provisioning
 * key; callers should fall back to {@link fetchKeyInfo} on 401/403.
 */
export async function fetchCredits(
  apiKey: string,
  signal?: AbortSignal,
): Promise<CreditsSnapshot> {
  const json = await get<CreditsResponse>('/credits', apiKey, signal);
  const total = json.data?.total_credits ?? 0;
  const used = json.data?.total_usage ?? 0;
  return {
    remaining: total - used,
    used,
    total,
    isFreeTier: total === 0,
    source: 'credits',
    fetchedAt: Date.now(),
  };
}

/**
 * Per-key info via `GET /auth/key`. Works with a normal inference key. Only
 * yields a `remaining` value when the key has a spend limit set.
 */
export async function fetchKeyInfo(
  apiKey: string,
  signal?: AbortSignal,
): Promise<CreditsSnapshot> {
  const json = await get<KeyResponse>('/auth/key', apiKey, signal);
  const used = json.data?.usage ?? 0;
  const limit = json.data?.limit ?? null;
  return {
    remaining: limit == null ? null : limit - used,
    used,
    total: limit,
    isFreeTier: json.data?.is_free_tier ?? false,
    source: 'key',
    fetchedAt: Date.now(),
    label: json.data?.label,
  };
}

/**
 * Best-effort balance fetch: prefer the account-wide `/credits` endpoint and
 * gracefully fall back to `/auth/key` when the key lacks provisioning scope.
 */
export async function fetchBalance(
  apiKey: string,
  signal?: AbortSignal,
): Promise<CreditsSnapshot> {
  try {
    return await fetchCredits(apiKey, signal);
  } catch (err) {
    if (err instanceof OpenRouterError && (err.status === 401 || err.status === 403)) {
      return await fetchKeyInfo(apiKey, signal);
    }
    throw err;
  }
}

/** Format a credit amount as USD, or a dash when unknown. */
export function formatCredits(amount: number | null): string {
  if (amount == null) return '—';
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
