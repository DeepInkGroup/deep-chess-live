export interface OpeningDbEntry {
  name: string;
  eco: string;
  moves: string[];
}

let cache: Promise<OpeningDbEntry[]> | null = null;

export function loadOpeningsDb(): Promise<OpeningDbEntry[]> {
  if (!cache) {
    cache = fetch('/data/openings.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load openings database: ${res.status}`);
        return res.json() as Promise<Record<string, { eco: string; moves: string[] }>>;
      })
      .then((raw) => Object.entries(raw).map(([name, v]) => ({ name, eco: v.eco, moves: v.moves })));
  }
  return cache;
}
