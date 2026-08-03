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

/**
 * Lichess's per-player opening explorer indexes a player's games on the fly and streams NDJSON
 * progress updates, ending with the final aggregate. We only need the final line.
 */
export async function getPlayerOpeningExplorer(player: string, color: 'white' | 'black'): Promise<OpeningExplorerResponse> {
  const params = new URLSearchParams({
    variant: 'standard',
    player,
    color,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: '8',
    topGames: '0',
    recentGames: '0',
  });
  const res = await fetch(`${BASE}/player?${params.toString()}`);
  if (!res.ok) throw new Error(`Player opening explorer failed: ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split('\n').filter(Boolean);
  const last = lines[lines.length - 1];
  return JSON.parse(last) as OpeningExplorerResponse;
}
