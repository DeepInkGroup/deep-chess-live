import { useNavigate } from 'react-router-dom';
import { timeAgo } from '../lib/chess';
import type { LichessGame } from '../types/lichess';

export function ResultPill({ result }: { result: 'win' | 'loss' | 'draw' }) {
  const styles = {
    win: 'bg-emerald-500/15 text-emerald-400',
    loss: 'bg-ruby-500/15 text-ruby-400',
    draw: 'bg-white/8 text-ink-300',
  };
  const text = { win: 'Won', loss: 'Lost', draw: 'Draw' };
  return <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${styles[result]}`}>{text[result]}</span>;
}

export function gameResult(game: LichessGame, username: string): 'win' | 'loss' | 'draw' {
  const isWhite = game.players.white.user?.id?.toLowerCase() === username.toLowerCase();
  return !game.winner ? 'draw' : (game.winner === 'white') === isWhite ? 'win' : 'loss';
}

export default function LichessGameRow({ game, username }: { game: LichessGame; username: string }) {
  const navigate = useNavigate();
  const isWhite = game.players.white.user?.id?.toLowerCase() === username.toLowerCase();
  const opponent = isWhite ? game.players.black : game.players.white;
  const result = gameResult(game, username);

  return (
    <button
      onClick={() => navigate(`/replay/${game.id}`, { state: { source: 'lichess', gameId: game.id } })}
      className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink-850/50 px-4 py-3 text-left transition-colors hover:border-gold-500/30"
    >
      <ResultPill result={result} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-100">
          vs {opponent.user?.title && <span className="text-gold-400">{opponent.user.title} </span>}
          {opponent.user?.name ?? opponent.name ?? 'Anonymous'} {opponent.rating && <span className="text-ink-500">({opponent.rating})</span>}
        </p>
        <p className="text-xs text-ink-500">
          {game.speed} · {game.rated ? 'Rated' : 'Casual'} · {game.opening?.name ?? game.variant}
        </p>
      </div>
      <span className="shrink-0 text-xs text-ink-500">{timeAgo(game.lastMoveAt ?? game.createdAt)}</span>
    </button>
  );
}
