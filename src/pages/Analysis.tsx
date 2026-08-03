import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Copy, Download, FlipVertical2, RotateCcw, Target, Upload, Wrench } from 'lucide-react';
import BoardPanel from '../components/BoardPanel';
import BoardEditor from '../components/BoardEditor';
import EvalBar from '../components/EvalBar';
import EngineLines from '../components/EngineLines';
import BookMoves from '../components/BookMoves';
import MoveList from '../components/MoveList';
import EngineSettings from '../components/EngineSettings';
import type { EngineSettingsValue } from '../components/EngineSettings';
import { useStockfish } from '../hooks/useStockfish';
import { useAsync } from '../hooks/useAsync';
import { useResponsiveBoardWidth } from '../hooks/useResponsiveBoardWidth';
import { useLandscapePhone } from '../hooks/useLandscapePhone';
import { getOpeningExplorer } from '../api/explorer';
import { movesFromPgn, movesToPgn, scoreToWhitePerspective, START_FEN } from '../lib/chess';
import type { MoveStep } from '../lib/chess';

export default function Analysis() {
  const [basePosition, setBasePosition] = useState(START_FEN);
  const [moves, setMoves] = useState<MoveStep[]>([]);
  const [index, setIndex] = useState(-1);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [showBestMove, setShowBestMove] = useState(true);
  const [engineSettings, setEngineSettings] = useState<EngineSettingsValue>({ multiPv: 3, depth: 18, skillLevel: null });
  const [editorOpen, setEditorOpen] = useState(false);

  const stockfish = useStockfish(true, { multiPv: engineSettings.multiPv, skillLevel: engineSettings.skillLevel });
  const boardWidth = useResponsiveBoardWidth();
  const landscapePhone = useLandscapePhone();
  const fen = index === -1 ? basePosition : moves[index].fen;
  const book = useAsync(() => getOpeningExplorer(fen), [fen]);

  useEffect(() => {
    if (!stockfish.ready) return;
    const t = setTimeout(() => stockfish.analyze(fen, engineSettings.depth), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, stockfish.ready, engineSettings.multiPv, engineSettings.depth, engineSettings.skillLevel]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(-1, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(moves.length - 1, i + 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moves.length]);

  function attemptMove(from: string, to: string): boolean {
    const chess = new Chess();
    chess.load(fen);
    let move;
    try {
      move = chess.move({ from, to, promotion: 'q' });
    } catch {
      return false;
    }
    if (!move) return false;

    const truncated = moves.slice(0, index + 1);
    truncated.push({ fen: chess.fen(), san: move.san, moveNumber: Math.floor(truncated.length / 2) + 1, color: move.color });
    setMoves(truncated);
    setIndex(truncated.length - 1);
    return true;
  }

  function playBookMove(uci: string) {
    attemptMove(uci.slice(0, 2), uci.slice(2, 4));
  }

  function handleDrop(from: string, to: string): boolean {
    setSelected(undefined);
    return attemptMove(from, to);
  }

  function handleSquareClick(square: string) {
    const chess = new Chess();
    chess.load(fen);
    const piece = chess.get(square as Parameters<Chess['get']>[0]);
    const turn = chess.turn();

    if (!selected) {
      if (piece && piece.color === turn) setSelected(square);
      return;
    }
    if (selected === square) {
      setSelected(undefined);
      return;
    }
    if (piece && piece.color === turn) {
      setSelected(square);
      return;
    }
    attemptMove(selected, square);
    setSelected(undefined);
  }

  function handleReset() {
    setBasePosition(START_FEN);
    setMoves([]);
    setIndex(-1);
    setSelected(undefined);
  }

  function handleImport() {
    const text = importText.trim();
    if (!text) return;

    const asFen = new Chess();
    try {
      asFen.load(text);
      setBasePosition(asFen.fen());
      setMoves([]);
      setIndex(-1);
      setImportError(undefined);
      setImportText('');
      setImportOpen(false);
      return;
    } catch {
      /* not a valid FEN, try PGN */
    }

    const parsed = movesFromPgn(text);
    if (parsed.length > 0) {
      setBasePosition(START_FEN);
      setMoves(parsed);
      setIndex(parsed.length - 1);
      setImportError(undefined);
      setImportText('');
      setImportOpen(false);
      return;
    }

    setImportError('Could not parse that as a FEN or PGN.');
  }

  async function copyFen() {
    await navigator.clipboard.writeText(fen);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function downloadPgn() {
    const pgn = movesToPgn(basePosition, moves);
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis.pgn';
    a.click();
    URL.revokeObjectURL(url);
  }

  const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const topLine = stockfish.lines[0];
  const persp = scoreToWhitePerspective(sideToMove, topLine?.scoreCp, topLine?.scoreMate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">Analysis Board</h1>
          <p className="mt-1 text-sm text-ink-400">Play out any position and get a live Stockfish evaluation, right in your browser.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setImportOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <Upload size={15} /> Import FEN/PGN
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            onClick={() => setOrientation((v) => (v === 'white' ? 'black' : 'white'))}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <FlipVertical2 size={15} /> Flip
          </button>
          <button
            onClick={() => setShowBestMove((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              showBestMove ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
            }`}
          >
            <Target size={15} /> Best move
          </button>
          <button
            onClick={() => setEditorOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              editorOpen ? 'border-gold-500/30 bg-gold-500/10 text-gold-400' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
            }`}
          >
            <Wrench size={15} /> Set up position
          </button>
          <EngineSettings value={engineSettings} onChange={setEngineSettings} />
        </div>
      </div>

      {editorOpen && (
        <BoardEditor
          initialFen={fen}
          onDone={(newFen) => {
            setBasePosition(newFen);
            setMoves([]);
            setIndex(-1);
            setEditorOpen(false);
          }}
          onCancel={() => setEditorOpen(false)}
        />
      )}

      {!editorOpen && importOpen && (
        <div className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-ink-850/60 p-4">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste a FEN or full PGN…"
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-ink-950/60 p-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
          />
          {importError && <p className="text-xs text-ruby-400">{importError}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setImportOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-ink-400 hover:text-ink-200">
              Cancel
            </button>
            <button onClick={handleImport} className="rounded-lg bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 hover:bg-gold-400">
              Load
            </button>
          </div>
        </div>
      )}

      {!editorOpen && (
      <div className={`flex flex-col items-center gap-6 lg:justify-center ${landscapePhone ? 'flex-row items-start' : 'lg:flex-row lg:items-start'}`}>
        <div className="flex items-start gap-3">
          <EvalBar cp={persp.cp} mate={persp.mate} height={boardWidth} loading={stockfish.thinking && stockfish.lines.length === 0} />
          <div className="flex flex-col items-center gap-2">
            <BoardPanel
              fen={fen}
              orientation={orientation}
              size={boardWidth}
              interactive
              onDrop={handleDrop}
              selectedSquare={selected}
              onSquareClick={handleSquareClick}
              bestMoveUci={showBestMove ? stockfish.bestMoveUci ?? stockfish.lines[0]?.pvUci[0] : undefined}
            />
            <div className="flex items-center gap-2">
              <NavButton onClick={() => setIndex(-1)} disabled={index === -1}>
                <ChevronFirst size={16} />
              </NavButton>
              <NavButton onClick={() => setIndex((i) => Math.max(-1, i - 1))} disabled={index === -1}>
                <ChevronLeft size={16} />
              </NavButton>
              <NavButton onClick={() => setIndex((i) => Math.min(moves.length - 1, i + 1))} disabled={index === moves.length - 1}>
                <ChevronRight size={16} />
              </NavButton>
              <NavButton onClick={() => setIndex(moves.length - 1)} disabled={index === moves.length - 1}>
                <ChevronLast size={16} />
              </NavButton>
              <button
                onClick={copyFen}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-ink-200 hover:bg-white/10"
              >
                <Copy size={12} /> {copied ? 'Copied!' : 'FEN'}
              </button>
              <button
                onClick={downloadPgn}
                disabled={moves.length === 0}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-ink-200 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
              >
                <Download size={12} /> PGN
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <BookMoves data={book.data} loading={book.loading} onPlay={playBookMove} />
          <EngineLines fen={fen} lines={stockfish.lines} thinking={stockfish.thinking} ready={stockfish.ready} />
          <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-3">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Moves</h2>
            <div className="h-[280px] overflow-y-auto">
              <MoveList moves={moves} activeIndex={index} onSelect={setIndex} />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function NavButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-ink-200 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
    >
      {children}
    </button>
  );
}
