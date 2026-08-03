import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Archive, BookOpen, Calendar, Circle, ExternalLink, LineChart, Star, Trophy } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import * as lichess from '../api/lichess';
import * as chesscom from '../api/chesscom';
import { getPlayerOpeningExplorer } from '../api/explorer';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import RatingChart from '../components/RatingChart';
import BookMoves from '../components/BookMoves';
import BetaBadge from '../components/BetaBadge';
import LichessGameRow, { ResultPill } from '../components/LichessGameRow';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { recordPlayerView } from '../lib/recentlyViewed';
import type { ChessComGame, ChessComStats } from '../types/chesscom';
import { timeAgo } from '../lib/chess';

const LICHESS_PERFS = ['bullet', 'blitz', 'rapid', 'classical', 'correspondence'];

async function loadProfile(username: string) {
  const [lichessRes, chesscomRes] = await Promise.allSettled([
    Promise.all([lichess.getUser(username), lichess.getUserGames(username, 15).catch(() => [])]),
    Promise.all([
      chesscom.getProfile(username),
      chesscom.getStats(username).catch((): ChessComStats => ({})),
      chesscom.getRecentGames(username, 15).catch(() => []),
    ]),
  ]);

  const lichessData = lichessRes.status === 'fulfilled' ? { user: lichessRes.value[0], games: lichessRes.value[1] } : null;
  const chesscomData =
    chesscomRes.status === 'fulfilled' ? { profile: chesscomRes.value[0], stats: chesscomRes.value[1], games: chesscomRes.value[2] } : null;

  if (!lichessData && !chesscomData) {
    throw new Error(`No player found on Lichess or Chess.com for "${username}"`);
  }
  return { lichessData, chesscomData };
}

export default function PlayerProfile() {
  const { username = '' } = useParams<{ username: string }>();
  const { data, loading, error } = useAsync(() => loadProfile(username), [username]);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(username));
  }, [username]);

  useEffect(() => {
    if (!data) return;
    const title = data.lichessData?.user.title ?? data.chesscomData?.profile.title ?? null;
    recordPlayerView(username, title);
  }, [data, username]);

  if (loading) return <LoadingBlock label={`Looking up ${username}…`} />;
  if (error || !data) return <ErrorBlock message={error?.message ?? 'Player not found.'} />;

  const { lichessData, chesscomData } = data;
  const displayTitle = lichessData?.user.title ?? chesscomData?.profile.title ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/8 bg-ink-850/60 p-6">
        {chesscomData?.profile.avatar ? (
          <img src={chesscomData.profile.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 font-display text-2xl text-ink-300">
            {username.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100">
            {lichessData?.user.title && <span className="text-gold-400">{lichessData.user.title}</span>}
            {chesscomData?.profile.name || lichessData?.user.username || username}
          </h1>
          <p className="text-sm text-ink-400">
            @{username}
            {lichessData?.user.online && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
                <Circle size={7} className="fill-current" /> Online on Lichess
              </span>
            )}
            {lichessData?.user.disabled && <span className="ml-2 text-ruby-400">Closed Lichess account</span>}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setFavorite(toggleFavorite(username, displayTitle))}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              favorite ? 'border-gold-500/30 bg-gold-500/10 text-gold-400' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
            }`}
          >
            <Star size={13} className={favorite ? 'fill-current' : ''} /> {favorite ? 'Favorited' : 'Favorite'}
          </button>
          {lichessData && (
            <a
              href={`https://lichess.org/@/${username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-200 hover:bg-white/10"
            >
              Lichess <ExternalLink size={12} />
            </a>
          )}
          {chesscomData && (
            <a
              href={`https://www.chess.com/member/${chesscomData.profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-200 hover:bg-white/10"
            >
              Chess.com <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {lichessData && (
        <StatsSection title="Lichess ratings" icon={<Trophy size={16} className="text-gold-400" />}>
          {LICHESS_PERFS.map((perf) => {
            const stat = lichessData.user.perfs?.[perf];
            if (!stat || stat.games === 0) return null;
            return <StatCard key={perf} label={perf} rating={stat.rating} sub={`${stat.games} games`} />;
          })}
        </StatsSection>
      )}

      {lichessData && <RatingHistorySection username={username} />}

      {lichessData && !lichessData.user.disabled && <MostPlayedOpeningsSection username={username} />}

      {chesscomData && (
        <StatsSection title="Chess.com ratings" icon={<Trophy size={16} className="text-gold-400" />}>
          {(['chess_bullet', 'chess_blitz', 'chess_rapid', 'chess_daily'] as const).map((key) => {
            const bucket = chesscomData.stats[key];
            if (!bucket?.last) return null;
            const label = key.replace('chess_', '');
            return <StatCard key={key} label={label} rating={bucket.last.rating} sub={bucket.record ? `${bucket.record.win}W ${bucket.record.loss}L ${bucket.record.draw}D` : undefined} />;
          })}
          {chesscomData.stats.fide !== undefined && chesscomData.stats.fide > 0 && (
            <StatCard label="FIDE" rating={chesscomData.stats.fide} sub="via Chess.com" />
          )}
        </StatsSection>
      )}

      {lichessData && lichessData.games.length > 0 && (
        <GamesSection title="Recent Lichess games" icon={<Calendar size={16} className="text-gold-400" />}>
          {lichessData.games.map((g) => (
            <LichessGameRow key={g.id} game={g} username={username} />
          ))}
          <Link
            to={`/players/${username}/games`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-ink-850/30 px-4 py-2.5 text-sm text-gold-400 transition-colors hover:border-gold-500/30 hover:bg-ink-850/50"
          >
            <Archive size={14} /> Browse full game archive
          </Link>
        </GamesSection>
      )}

      {chesscomData && chesscomData.games.length > 0 && (
        <GamesSection title="Recent Chess.com games" icon={<Calendar size={16} className="text-gold-400" />}>
          {chesscomData.games.map((g) => (
            <ChessComGameRow key={g.url} game={g} username={username} />
          ))}
        </GamesSection>
      )}
    </div>
  );
}

function StatsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
        {icon} {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{items}</div>
    </section>
  );
}

function RatingHistorySection({ username }: { username: string }) {
  const { data, loading, error } = useAsync(() => lichess.getRatingHistory(username), [username]);
  const withHistory = data?.filter((entry) => entry.points.length >= 2) ?? [];
  const [selected, setSelected] = useState<string | null>(null);

  if (loading || error || withHistory.length === 0) return null;

  const activeName = selected && withHistory.some((e) => e.name === selected) ? selected : withHistory[0].name;
  const active = withHistory.find((e) => e.name === activeName)!;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
        <LineChart size={16} className="text-gold-400" /> Rating history
      </h2>
      <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {withHistory.map((entry) => (
            <button
              key={entry.name}
              onClick={() => setSelected(entry.name)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                entry.name === activeName ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'
              }`}
            >
              {entry.name}
            </button>
          ))}
        </div>
        <RatingChart points={active.points} />
      </div>
    </section>
  );
}

function MostPlayedOpeningsSection({ username }: { username: string }) {
  const white = useAsync(() => getPlayerOpeningExplorer(username, 'white'), [username]);
  const black = useAsync(() => getPlayerOpeningExplorer(username, 'black'), [username]);

  const whiteEmpty = !white.loading && (!white.data || white.data.moves.length === 0);
  const blackEmpty = !black.loading && (!black.data || black.data.moves.length === 0);
  if (whiteEmpty && blackEmpty) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
        <BookOpen size={16} className="text-gold-400" /> Most played openings <BetaBadge />
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BookMoves data={white.data} loading={white.loading} minGames={1} title="As White" />
        <BookMoves data={black.data} loading={black.loading} minGames={1} title="As Black" />
      </div>
    </section>
  );
}

function StatCard({ label, rating, sub }: { label: string; rating: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-ink-850/60 p-3">
      <p className="text-xs capitalize text-ink-400">{label}</p>
      <p className="font-display text-xl font-semibold text-ink-100">{rating}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-500">{sub}</p>}
    </div>
  );
}

function GamesSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
        {icon} {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}


function ChessComGameRow({ game, username }: { game: ChessComGame; username: string }) {
  const navigate = useNavigate();
  const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
  const opponent = isWhite ? game.black : game.white;
  const mySide = isWhite ? game.white : game.black;
  const result: 'win' | 'loss' | 'draw' =
    mySide.result === 'win' ? 'win' : ['agreed', 'stalemate', 'repetition', 'insufficient', 'timevsinsufficient', '50move'].includes(mySide.result) ? 'draw' : 'loss';

  return (
    <button
      onClick={() => navigate(`/replay/chesscom-${game.end_time}`, { state: { source: 'chesscom', game } })}
      className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink-850/50 px-4 py-3 text-left transition-colors hover:border-gold-500/30"
    >
      <ResultPill result={result} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-100">
          vs {opponent.username} <span className="text-ink-500">({opponent.rating})</span>
        </p>
        <p className="text-xs text-ink-500 capitalize">
          {game.time_class} · {game.rated ? 'Rated' : 'Casual'}
        </p>
      </div>
      <span className="shrink-0 text-xs text-ink-500">{timeAgo(game.end_time * 1000)}</span>
    </button>
  );
}
