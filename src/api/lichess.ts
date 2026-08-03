import type {
  LichessBroadcastRoundDetail,
  LichessBroadcastTop,
  LichessBroadcastTourDetail,
  LichessGame,
  LichessGameStreamEvent,
  LichessLeaderboard,
  LichessPuzzle,
  LichessRatingHistoryEntry,
  LichessTeam,
  LichessTeamMember,
  LichessTeamSearchResult,
  LichessTournamentDetail,
  LichessTournamentsOverview,
  LichessTvChannels,
  LichessTvFeedEvent,
  LichessUser,
} from '../types/lichess';

const BASE = 'https://lichess.org';

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`Lichess API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function getTvChannels(): Promise<LichessTvChannels> {
  return getJson<LichessTvChannels>('/api/tv/channels');
}

export function getUser(username: string): Promise<LichessUser> {
  return getJson<LichessUser>(`/api/user/${encodeURIComponent(username)}`);
}

export function getDailyPuzzle(): Promise<LichessPuzzle> {
  return getJson<LichessPuzzle>('/api/puzzle/daily');
}

export function getNextPuzzle(): Promise<LichessPuzzle> {
  return getJson<LichessPuzzle>('/api/puzzle/next');
}

export function getRatingHistory(username: string): Promise<LichessRatingHistoryEntry[]> {
  return getJson<LichessRatingHistoryEntry[]>(`/api/user/${encodeURIComponent(username)}/rating-history`);
}

export function getLeaderboard(perfType: string, nb = 20): Promise<LichessLeaderboard> {
  return getJson<LichessLeaderboard>(`/api/player/top/${nb}/${encodeURIComponent(perfType)}`);
}

export function getTournaments(): Promise<LichessTournamentsOverview> {
  return getJson<LichessTournamentsOverview>('/api/tournament');
}

export function getTournament(id: string): Promise<LichessTournamentDetail> {
  return getJson<LichessTournamentDetail>(`/api/tournament/${encodeURIComponent(id)}`);
}

export function getBroadcastTop(): Promise<LichessBroadcastTop> {
  return getJson<LichessBroadcastTop>('/api/broadcast/top?nb=20');
}

export function getBroadcastTour(tourId: string): Promise<LichessBroadcastTourDetail> {
  return getJson<LichessBroadcastTourDetail>(`/api/broadcast/${encodeURIComponent(tourId)}`);
}

export function getBroadcastRound(roundId: string): Promise<LichessBroadcastRoundDetail> {
  return getJson<LichessBroadcastRoundDetail>(`/api/broadcast/-/-/${encodeURIComponent(roundId)}`);
}

export async function getBroadcastRoundPgn(roundId: string): Promise<string> {
  const res = await fetch(`${BASE}/api/broadcast/round/${encodeURIComponent(roundId)}.pgn`);
  if (!res.ok) throw new Error(`Broadcast round PGN failed: ${res.status}`);
  return res.text();
}

export async function getUserGames(username: string, max = 20, vs?: string): Promise<LichessGame[]> {
  const params = new URLSearchParams({ max: String(max), pgnInJson: 'true', opening: 'true', sort: 'dateDesc' });
  if (vs) params.set('vs', vs);
  const res = await fetch(`${BASE}/api/games/user/${encodeURIComponent(username)}?${params.toString()}`, {
    headers: { Accept: 'application/x-ndjson' },
  });
  if (!res.ok) throw new Error(`Lichess games export failed: ${res.status}`);
  const text = await res.text();
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as LichessGame);
}

export function getGamePgn(gameId: string): Promise<string> {
  return fetch(`${BASE}/game/export/${gameId}?literate=false`, {
    headers: { Accept: 'application/x-chess-pgn' },
  }).then((res) => {
    if (!res.ok) throw new Error(`Lichess game export failed: ${res.status}`);
    return res.text();
  });
}

/** Streams NDJSON lines from a lichess endpoint, calling onEvent for each parsed line. Returns an abort function. */
export function streamNdjson<T>(path: string, onEvent: (evt: T) => void, onError?: (err: unknown) => void): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE}${path}`, { signal: controller.signal, headers: { Accept: 'application/x-ndjson' } });
      if (!res.ok || !res.body) throw new Error(`Stream ${path} failed: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            onEvent(JSON.parse(line) as T);
          } catch {
            // ignore malformed line
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') onError?.(err);
    }
  })();

  return () => controller.abort();
}

export function streamTvChannelFeed(channel: string, onEvent: (evt: LichessTvFeedEvent) => void, onError?: (err: unknown) => void) {
  return streamNdjson<LichessTvFeedEvent>(`/api/tv/${channel}/feed`, onEvent, onError);
}

export function streamGame(gameId: string, onEvent: (evt: LichessGameStreamEvent) => void, onError?: (err: unknown) => void) {
  return streamNdjson<LichessGameStreamEvent>(`/api/stream/game/${gameId}`, onEvent, onError);
}

export function searchTeams(query: string, page = 1): Promise<LichessTeamSearchResult> {
  return getJson<LichessTeamSearchResult>(`/api/team/search?text=${encodeURIComponent(query)}&page=${page}`);
}

export function getTeam(teamId: string): Promise<LichessTeam> {
  return getJson<LichessTeam>(`/api/team/${encodeURIComponent(teamId)}`);
}

export async function getTeamMembers(teamId: string, limit = 30): Promise<LichessTeamMember[]> {
  const res = await fetch(`${BASE}/api/team/${encodeURIComponent(teamId)}/users`, { headers: { Accept: 'application/x-ndjson' } });
  if (!res.ok || !res.body) throw new Error(`Team members fetch failed: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const members: LichessTeamMember[] = [];
  let buffer = '';
  while (members.length < limit) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      members.push(JSON.parse(line) as LichessTeamMember);
      if (members.length >= limit) break;
    }
  }
  reader.cancel().catch(() => {});
  return members;
}
