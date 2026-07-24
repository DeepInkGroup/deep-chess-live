import { useEffect, useRef } from 'react';
import type { MoveStep } from '../lib/chess';

interface MoveListProps {
  moves: MoveStep[];
  activeIndex: number;
  onSelect?: (index: number) => void;
}

export default function MoveList({ moves, activeIndex, onSelect }: MoveListProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const pairs: { num: number; white?: MoveStep; whiteIdx?: number; black?: MoveStep; blackIdx?: number }[] = [];
  moves.forEach((m, i) => {
    if (m.color === 'w') {
      pairs.push({ num: m.moveNumber, white: m, whiteIdx: i });
    } else {
      const last = pairs[pairs.length - 1];
      if (last && last.black === undefined) {
        last.black = m;
        last.blackIdx = i;
      } else {
        pairs.push({ num: m.moveNumber, black: m, blackIdx: i });
      }
    }
  });

  if (moves.length === 0) {
    return <p className="p-4 text-sm text-ink-400">No moves yet.</p>;
  }

  return (
    <div className="grid h-full grid-cols-[2.5rem_1fr_1fr] content-start gap-y-0.5 text-sm">
      {pairs.map((p) => (
        <div key={p.num} className="contents">
          <span className="flex items-center px-2 py-1 text-ink-500 tabular-nums">{p.num}.</span>
          <MoveCell san={p.white?.san} idx={p.whiteIdx} active={activeIndex === p.whiteIdx} onSelect={onSelect} refEl={activeIndex === p.whiteIdx ? activeRef : undefined} />
          <MoveCell san={p.black?.san} idx={p.blackIdx} active={activeIndex === p.blackIdx} onSelect={onSelect} refEl={activeIndex === p.blackIdx ? activeRef : undefined} />
        </div>
      ))}
    </div>
  );
}

function MoveCell({
  san,
  idx,
  active,
  onSelect,
  refEl,
}: {
  san?: string;
  idx?: number;
  active: boolean;
  onSelect?: (i: number) => void;
  refEl?: React.RefObject<HTMLButtonElement | null>;
}) {
  if (san === undefined || idx === undefined) return <span />;
  return (
    <button
      ref={refEl}
      onClick={() => onSelect?.(idx)}
      className={`rounded px-2 py-1 text-left tabular-nums transition-colors ${
        active ? 'bg-gold-500/20 text-gold-300 font-medium' : 'text-ink-200 hover:bg-white/5'
      }`}
    >
      {san}
    </button>
  );
}
