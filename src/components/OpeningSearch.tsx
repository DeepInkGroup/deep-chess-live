import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { loadOpeningsDb } from '../lib/openingsDb';
import type { OpeningDbEntry } from '../lib/openingsDb';

interface OpeningSearchProps {
  onSelect: (entry: OpeningDbEntry) => void;
}

export default function OpeningSearch({ onSelect }: OpeningSearchProps) {
  const [db, setDb] = useState<OpeningDbEntry[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadOpeningsDb()
      .then(setDb)
      .catch(() => setDb([]));
  }, []);

  const results = useMemo(() => {
    if (!db || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const isEco = /^[a-e]\d{0,2}$/i.test(q);
    const matches = db.filter((e) => (isEco ? e.eco.toLowerCase().startsWith(q) : e.name.toLowerCase().includes(q)));
    matches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.name.length - b.name.length;
    });
    return matches.slice(0, 25);
  }, [db, query]);

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-3">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/60 px-3 py-2">
        <Search size={15} className="shrink-0 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={db ? `Search ${db.length.toLocaleString()} openings…` : 'Loading openings…'}
          disabled={!db}
          className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
        />
      </div>

      {query.trim() && (
        <div className="mt-2 flex max-h-72 flex-col gap-0.5 overflow-y-auto">
          {results.length === 0 && <p className="px-2 py-3 text-sm text-ink-500">No openings match "{query}".</p>}
          {results.map((entry) => (
            <button
              key={entry.name}
              onClick={() => onSelect(entry)}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
            >
              <span className="truncate text-ink-200">{entry.name}</span>
              <span className="shrink-0 text-xs text-ink-500">{entry.eco}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
