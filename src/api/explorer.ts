import type { OpeningExplorerResponse } from '../types/explorer';

const BASE = 'https://explorer.lichess.org';

export async function getOpeningExplorer(fen: string): Promise<OpeningExplorerResponse> {
  const params = new URLSearchParams({ variant: 'standard', fen, moves: '10', topGames: '0', recentGames: '0' });
  const res = await fetch(`${BASE}/lichess?${params.toString()}`);
  if (!res.ok) throw new Error(`Opening explorer failed: ${res.status}`);
  return res.json() as Promise<OpeningExplorerResponse>;
}
