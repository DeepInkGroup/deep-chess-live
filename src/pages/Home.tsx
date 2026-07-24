import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PuzzleIcon, Radio, Search, Swords } from 'lucide-react';
import TvChannelCard from '../components/TvChannelCard';
import { useAsync } from '../hooks/useAsync';
import { getDailyPuzzle } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import BoardPanel from '../components/BoardPanel';
import { turnColorFromFen } from '../lib/chess';

const FEATURED_CHANNELS = ['best', 'bullet', 'blitz', 'rapid', 'classical', 'bot'];

export default function Home() {
  const puzzle = useAsync(() => getDailyPuzzle(), []);
  const puzzleFen = puzzle.data?.puzzle.fen;

  return (
    <div className="flex flex-col gap-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-ink-850 via-ink-900 to-ink-950 px-6 py-14 text-center sm:py-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-ink-300">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-400" /> Live games updating in real time
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-100 sm:text-6xl">
            Chess, <span className="text-gradient-gold">live</span> and everywhere.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-ink-300 sm:text-lg">
            Watch top games stream in real time, look up any Lichess or Chess.com player, and solve the daily puzzle — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/tv"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-glow-gold transition-transform hover:scale-[1.03]"
            >
              <Radio size={16} /> Watch live TV
            </Link>
            <Link
              to="/players"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-ink-100 transition-colors hover:bg-white/10"
            >
              <Search size={16} /> Find a player
            </Link>
          </div>
        </motion.div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-100">
            <Swords size={20} className="text-gold-400" /> Featured live games
          </h2>
          <Link to="/tv" className="flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-gold-400">
            All channels <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED_CHANNELS.map((c) => (
            <TvChannelCard key={c} channelKey={c} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-100">
            <PuzzleIcon size={20} className="text-gold-400" /> Daily puzzle
          </h2>
          <Link to="/puzzle" className="flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-gold-400">
            Solve it <ArrowRight size={14} />
          </Link>
        </div>
        {puzzle.loading && <LoadingBlock label="Fetching today's puzzle…" />}
        {puzzle.error && <ErrorBlock message="Couldn't load the daily puzzle." />}
        {puzzle.data && puzzleFen && (
          <Link to="/puzzle" className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-ink-850/50 p-6 sm:flex-row sm:items-center">
            <BoardPanel fen={puzzleFen} orientation={turnColorFromFen(puzzleFen)} size={200} />
            <div className="text-center sm:text-left">
              <p className="text-sm text-ink-400">Rating {puzzle.data.puzzle.rating}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink-100">Can you find the best move?</h3>
              <p className="mt-1 text-sm text-ink-300">
                {puzzle.data.puzzle.themes.slice(0, 4).join(' · ')}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-400">
                Open puzzle <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        )}
      </section>
    </div>
  );
}
