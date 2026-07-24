import type { OpeningExplorerResponse } from '../types/explorer';

const BASE = 'https://explorer.lichess.org';

async function fetchOnce(fen: string): Promise<OpeningExplorerResponse> {
  const params = new URLSearchParams({ variant: 'standard', fen, moves: '10', topGames: '0', recentGames: '0' });
  const res = await fetch(`${BASE}/lichess?${params.toString()}`);
  if (!res.ok) throw new Error(`Opening explorer failed: ${res.status}`);
  return res.json() as Promise<OpeningExplorerResponse>;
}

/** The explorer service occasionally rate-limits; retry a couple of times with backoff before giving up. */
export async function getOpeningExplorer(fen: string, attempts = 3): Promise<OpeningExplorerResponse> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchOnce(fen);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
  throw lastError;
}
