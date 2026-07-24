import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';

const primaryLinks = [
  { to: '/', label: 'Home' },
  { to: '/tv', label: 'Live TV' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/players', label: 'Players' },
  { to: '/analysis', label: 'Analysis' },
  { to: '/puzzle', label: 'Puzzle' },
];

const moreLinks = [
  { to: '/broadcasts', label: 'Broadcasts' },
  { to: '/openings', label: 'Openings' },
  { to: '/leaderboards', label: 'Leaderboards' },
];

const allLinks = [...primaryLinks, ...moreLinks];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/8 text-ink-100' : 'text-ink-300 hover:text-ink-100 hover:bg-white/5'
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const moreRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const setHeight = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/players/${encodeURIComponent(trimmed)}`);
    setQuery('');
    setOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5">
      <div ref={barRef} className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-semibold tracking-tight text-ink-100">
            DeepChess<span className="text-gradient-gold"> Live</span>
          </span>
        </NavLink>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {primaryLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                moreOpen ? 'bg-white/8 text-ink-100' : 'text-ink-300 hover:text-ink-100 hover:bg-white/5'
              }`}
            >
              More <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full mt-1 flex min-w-40 flex-col gap-0.5 rounded-xl border border-white/8 bg-ink-850 p-1.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
                {moreLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setMoreOpen(false)}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-1.5 md:flex">
          <Search size={15} className="text-ink-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a player…"
            className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none"
          />
        </form>

        <button
          className="ml-auto rounded-lg p-2 text-ink-200 hover:bg-white/5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 px-4 pb-4 md:hidden">
          <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-2">
            <Search size={15} className="text-ink-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a player…"
              className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none"
            />
          </form>
          <nav className="mt-2 flex flex-col gap-1">
            {allLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/8 text-ink-100' : 'text-ink-300 hover:text-ink-100 hover:bg-white/5'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
