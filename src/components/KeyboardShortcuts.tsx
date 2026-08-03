import { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['?'], desc: 'Show this shortcuts panel' },
  { keys: ['←', '→'], desc: 'Step through moves (Replay, Analysis, Watch, Broadcast games)' },
  { keys: ['Esc'], desc: 'Close dialogs and panels' },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isTyping) return;

      if (e.key === '?') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/8 bg-ink-850 p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-100">
            <Keyboard size={18} className="text-gold-400" /> Keyboard shortcuts
          </h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-400 hover:text-ink-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-ink-300">{s.desc}</span>
              <span className="flex shrink-0 gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-ink-100">
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
