export interface RepertoireEntry {
  id: string;
  name: string;
  moves: string[];
  color: 'white' | 'black';
  addedAt: number;
}

const KEY = 'deepchess.repertoire.v1';

function readAll(): RepertoireEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RepertoireEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: RepertoireEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* localStorage unavailable */
  }
}

export function getRepertoire(): RepertoireEntry[] {
  return readAll().sort((a, b) => b.addedAt - a.addedAt);
}

export function addRepertoireEntry(name: string, moves: string[], color: 'white' | 'black') {
  const all = readAll();
  all.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, moves, color, addedAt: Date.now() });
  writeAll(all);
}

export function removeRepertoireEntry(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
}
