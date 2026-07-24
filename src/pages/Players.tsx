import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'Magnus Carlsen', username: 'DrNykterstein' },
  { label: 'Hikaru Nakamura', username: 'Hikaru' },
  { label: 'Alireza Firouzja', username: 'Alireza2003' },
  { label: 'Ian Nepomniachtchi', username: 'lachesisQ' },
  { label: 'Fabiano Caruana', username: 'FabianoCaruana' },
  { label: 'GothamChess', username: 'GothamChess' },
];

export default function Players() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function go(username: string) {
    const trimmed = username.trim();
    if (!trimmed) return;
    navigate(`/players/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-8 text-center">
      <div>
        <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <User className="text-gold-400" /> Find a player
        </h1>
        <p className="mt-2 text-sm text-ink-400">Search any Lichess or Chess.com username to see their stats and recent games.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(query);
        }}
        className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
      >
        <Search size={18} className="text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. DrNykterstein, Hikaru…"
          className="w-full bg-transparent text-base text-ink-100 placeholder:text-ink-500 focus:outline-none"
          autoFocus
        />
        <button type="submit" className="shrink-0 rounded-lg bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 hover:bg-gold-400">
          Search
        </button>
      </form>

      <div className="w-full">
        <p className="mb-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Popular players</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.username}
              onClick={() => go(s.username)}
              className="rounded-lg border border-white/8 bg-ink-850/60 px-3 py-2.5 text-left text-sm text-ink-200 transition-colors hover:border-gold-500/30 hover:text-gold-300"
            >
              {s.label}
              <span className="block text-xs text-ink-500">@{s.username}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
