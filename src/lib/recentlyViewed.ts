export interface RecentPlayer {
  username: string;
  title?: string | null;
  viewedAt: number;
}

const KEY = 'deepchess.recentlyViewed.v1';
const MAX_ENTRIES = 12;

function readAll(): RecentPlayer[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentPlayer[]) : [];
  } catch {
    return [];
  }
}

export function getRecentlyViewed(limit = 8): RecentPlayer[] {
  return readAll().slice(0, limit);
}

export function recordPlayerView(username: string, title?: string | null) {
  try {
    const all = readAll().filter((p) => p.username.toLowerCase() !== username.toLowerCase());
    all.unshift({ username, title, viewedAt: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, MAX_ENTRIES)));
  } catch {
    /* localStorage unavailable */
  }
}
