import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { searchTeams } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>`]/g, '')
    .trim();
}

export default function Teams() {
  const [query, setQuery] = useState('chess');
  const [submitted, setSubmitted] = useState('chess');
  const { data, loading, error } = useAsync(() => searchTeams(submitted), [submitted]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Users className="text-gold-400" /> Teams
        </h1>
        <p className="mt-1 text-sm text-ink-400">Search Lichess teams and clubs.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim() || 'chess');
        }}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams…"
          className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
        />
        <button type="submit" className="shrink-0 rounded-lg bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 hover:bg-gold-400">
          Search
        </button>
      </form>

      {loading && <LoadingBlock label="Searching teams…" />}
      {error && <ErrorBlock message="Couldn't search teams." />}

      {data && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.currentPageResults.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-ink-850/60 p-4 transition-colors hover:border-gold-500/30"
            >
              <p className="font-semibold text-ink-100">{team.name}</p>
              <p className="line-clamp-2 text-xs text-ink-400">{stripMarkdown(team.description ?? '')}</p>
              <p className="mt-1 text-xs text-ink-500">{team.nbMembers.toLocaleString()} members</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
