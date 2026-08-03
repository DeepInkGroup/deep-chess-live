export interface PuzzleHistoryEntry {
  id: string;
  rating: number;
  solved: boolean;
  date: number;
}

const HISTORY_KEY = 'deepchess.puzzleHistory.v1';
const BEST_STREAK_KEY = 'deepchess.bestStreak.v1';
const MAX_ENTRIES = 200;

function readAll(): PuzzleHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as PuzzleHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordPuzzleResult(entry: Omit<PuzzleHistoryEntry, 'date'>) {
  try {
    const all = readAll();
    all.unshift({ ...entry, date: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all.slice(0, MAX_ENTRIES)));
  } catch {
    /* localStorage unavailable */
  }
}

export function getRecentPuzzles(limit = 10): PuzzleHistoryEntry[] {
  return readAll().slice(0, limit);
}

export function getPuzzleStats() {
  const all = readAll();
  return {
    totalSolved: all.filter((e) => e.solved).length,
    totalAttempted: all.length,
    bestStreak: getBestStreak(),
  };
}

export function getBestStreak(): number {
  try {
    return Number(localStorage.getItem(BEST_STREAK_KEY) ?? 0);
  } catch {
    return 0;
  }
}

export function recordStreak(count: number) {
  try {
    if (count > getBestStreak()) localStorage.setItem(BEST_STREAK_KEY, String(count));
  } catch {
    /* localStorage unavailable */
  }
}

const RUSH_BEST_PREFIX = 'deepchess.rushBest.v1.';

export function getBestRushScore(durationSec: number): number {
  try {
    return Number(localStorage.getItem(RUSH_BEST_PREFIX + durationSec) ?? 0);
  } catch {
    return 0;
  }
}

export function recordRushScore(durationSec: number, score: number) {
  try {
    if (score > getBestRushScore(durationSec)) localStorage.setItem(RUSH_BEST_PREFIX + durationSec, String(score));
  } catch {
    /* localStorage unavailable */
  }
}
