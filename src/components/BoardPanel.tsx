import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

interface BoardPanelProps {
  fen: string;
  orientation?: 'white' | 'black';
  lastMoveUci?: string;
  interactive?: boolean;
  onDrop?: (from: string, to: string) => boolean;
  size?: number;
  selectedSquare?: string;
  onSquareClick?: (square: string) => void;
  bestMoveUci?: string;
}

export default function BoardPanel({
  fen,
  orientation = 'white',
  lastMoveUci,
  interactive = false,
  onDrop,
  size,
  selectedSquare,
  onSquareClick,
  bestMoveUci,
}: BoardPanelProps) {
  const [width, setWidth] = useState(size ?? 480);

  useEffect(() => {
    if (size) {
      setWidth(size);
      return;
    }
    function update() {
      const vw = window.innerWidth;
      const target = Math.min(560, vw - (vw < 640 ? 48 : 96));
      setWidth(Math.max(260, target));
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [size]);

  const highlightStyles: Record<string, React.CSSProperties> = {};
  if (lastMoveUci && lastMoveUci.length >= 4) {
    const from = lastMoveUci.slice(0, 2);
    const to = lastMoveUci.slice(2, 4);
    highlightStyles[from] = { backgroundColor: 'rgba(233, 185, 73, 0.35)' };
    highlightStyles[to] = { backgroundColor: 'rgba(233, 185, 73, 0.45)' };
  }
  if (selectedSquare) {
    highlightStyles[selectedSquare] = { backgroundColor: 'rgba(47, 216, 143, 0.45)' };
  }

  const arrows: [string, string, string?][] =
    bestMoveUci && bestMoveUci.length >= 4 ? [[bestMoveUci.slice(0, 2), bestMoveUci.slice(2, 4), 'rgb(47, 216, 143)']] : [];

  return (
    <div className="inline-block rounded-2xl border border-white/8 bg-ink-900/60 p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] sm:p-3">
      <Chessboard
        position={fen}
        boardOrientation={orientation}
        boardWidth={width}
        arePiecesDraggable={interactive}
        customSquareStyles={highlightStyles}
        customArrows={arrows as never}
        animationDuration={200}
        customBoardStyle={{ borderRadius: '10px' }}
        customDarkSquareStyle={{ backgroundColor: '#6b7a99' }}
        customLightSquareStyle={{ backgroundColor: '#e4e8f3' }}
        onPieceDrop={(from, to) => (onDrop ? onDrop(from, to) : false)}
        onSquareClick={(square) => onSquareClick?.(square)}
      />
    </div>
  );
}
