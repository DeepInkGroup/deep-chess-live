import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Shuffle, Trash2 } from 'lucide-react';
import PuzzleBoard from '../components/PuzzleBoard';
import { getRepertoire, removeRepertoireEntry } from '../lib/repertoire';
import { repertoireToPuzzleShape } from '../lib/chess';
import type { RepertoireEntry } from '../lib/repertoire';
import type { LichessPuzzle } from '../types/lichess';

export default function RepertoireTrainer() {
  const [entries, setEntries] = useState<RepertoireEntry[]>(() => getRepertoire());
  const [training, setTraining] = useState<{ entry: RepertoireEntry; puzzle: LichessPuzzle } | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  function remove(id: string) {
    removeRepertoireEntry(id);
    setEntries(getRepertoire());
  }

  function train(entry: RepertoireEntry) {
    const puzzle = repertoireToPuzzleShape(entry.moves, entry.color);
    if (!puzzle) return;
    setSolvedCount(0);
    setTraining({ entry, puzzle });
  }

  function trainRandom() {
    if (entries.length === 0) return;
    train(entries[Math.floor(Math.random() * entries.length)]);
  }

  if (training) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
        <div>
          <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
            <BookMarked className="text-gold-400" /> {training.entry.name}
          </h1>
          <p className="mt-1 text-sm text-ink-400 capitalize">Playing {training.entry.color}</p>
        </div>

        <PuzzleBoard key={training.entry.id} puzzle={training.puzzle} onSolved={() => setSolvedCount((c) => c + 1)} />

        <div className="flex gap-2">
          <button
            onClick={() => train(training.entry)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            Retry this line
          </button>
          <button onClick={trainRandom} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            <Shuffle size={14} /> Random line
          </button>
          <button onClick={() => setTraining(null)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            Back to list
          </button>
        </div>
        {solvedCount > 0 && <p className="text-xs text-ink-500">Solved {solvedCount} time{solvedCount > 1 ? 's' : ''} this session.</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
            <BookMarked className="text-gold-400" /> Repertoire Trainer
          </h1>
          <p className="mt-1 text-sm text-ink-400">Openings you've saved from the Openings Explorer, ready to quiz yourself on.</p>
        </div>
        {entries.length > 0 && (
          <button onClick={trainRandom} className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400">
            <Shuffle size={15} /> Train random
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">
          No saved lines yet. Build a line in the{' '}
          <Link to="/openings" className="text-gold-400 hover:text-gold-300">
            Openings Explorer
          </Link>{' '}
          and save it to your repertoire.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <div key={e.id} className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-ink-850/60 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink-100">{e.name}</p>
                <button onClick={() => remove(e.id)} aria-label="Remove line" className="shrink-0 text-ink-500 hover:text-ruby-400">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-xs capitalize text-ink-400">
                Playing {e.color} · {e.moves.length} moves
              </p>
              <button
                onClick={() => train(e)}
                className="mt-1 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-200 hover:bg-white/10"
              >
                Train
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
