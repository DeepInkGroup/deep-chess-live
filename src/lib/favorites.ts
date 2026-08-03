export interface FavoritePlayer {
  username: string;
  title?: string | null;
  addedAt: number;
}

const KEY = 'deepchess.favorites.v1';

function readAll(): FavoritePlayer[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavoritePlayer[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: FavoritePlayer[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* localStorage unavailable */
  }
}

export function getFavorites(): FavoritePlayer[] {
  return readAll().sort((a, b) => b.addedAt - a.addedAt);
}

export function isFavorite(username: string): boolean {
  return readAll().some((f) => f.username.toLowerCase() === username.toLowerCase());
}

export function addFavorite(username: string, title?: string | null) {
  const all = readAll();
  if (all.some((f) => f.username.toLowerCase() === username.toLowerCase())) return;
  all.push({ username, title, addedAt: Date.now() });
  writeAll(all);
}

export function removeFavorite(username: string) {
  writeAll(readAll().filter((f) => f.username.toLowerCase() !== username.toLowerCase()));
}

export function toggleFavorite(username: string, title?: string | null): boolean {
  if (isFavorite(username)) {
    removeFavorite(username);
    return false;
  }
  addFavorite(username, title);
  return true;
}
