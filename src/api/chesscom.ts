import type { ChessComArchiveGames, ChessComProfile, ChessComPuzzle, ChessComStats } from '../types/chesscom';

const BASE = 'https://api.chess.com/pub';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Chess.com API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function getProfile(username: string): Promise<ChessComProfile> {
  return getJson<ChessComProfile>(`/player/${encodeURIComponent(username)}`);
}

export function getStats(username: string): Promise<ChessComStats> {
  return getJson<ChessComStats>(`/player/${encodeURIComponent(username)}/stats`);
}

export function isOnline(username: string): Promise<{ online: boolean }> {
  return getJson<{ online: boolean }>(`/player/${encodeURIComponent(username)}/is-online`);
}

export function getDailyPuzzle(): Promise<ChessComPuzzle> {
  return getJson<ChessComPuzzle>('/puzzle');
}

export async function getRecentGames(username: string, limit = 20) {
  const archivesRes = await getJson<{ archives: string[] }>(`/player/${encodeURIComponent(username)}/games/archives`);
  const archives = archivesRes.archives.slice(-2).reverse();
  const games: ChessComArchiveGames['games'] = [];
  for (const archiveUrl of archives) {
    const res = await fetch(archiveUrl);
    if (!res.ok) continue;
    const data = (await res.json()) as ChessComArchiveGames;
    games.push(...data.games.reverse());
    if (games.length >= limit) break;
  }
  return games.slice(0, limit);
}
