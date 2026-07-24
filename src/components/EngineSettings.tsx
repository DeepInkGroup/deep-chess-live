import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';

export interface EngineSettingsValue {
  multiPv: number;
  depth: number;
  skillLevel: number | null;
}

interface EngineSettingsProps {
  value: EngineSettingsValue;
  onChange: (value: EngineSettingsValue) => void;
}

export default function EngineSettings({ value, onChange }: EngineSettingsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
          open ? 'border-white/20 bg-white/10 text-ink-100' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
        }`}
      >
        <Settings size={15} /> Engine settings
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-white/8 bg-ink-850 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          <Row label="Lines" value={`${value.multiPv}`}>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={value.multiPv}
              onChange={(e) => onChange({ ...value, multiPv: Number(e.target.value) })}
              className="w-full accent-gold-500"
            />
          </Row>

          <Row label="Depth" value={`${value.depth}`}>
            <input
              type="range"
              min={10}
              max={24}
              step={1}
              value={value.depth}
              onChange={(e) => onChange({ ...value, depth: Number(e.target.value) })}
              className="w-full accent-gold-500"
            />
          </Row>

          <Row label="Strength" value={value.skillLevel === null ? 'Full' : `Level ${value.skillLevel}`}>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={value.skillLevel ?? 20}
                disabled={value.skillLevel === null}
                onChange={(e) => onChange({ ...value, skillLevel: Number(e.target.value) })}
                className="w-full accent-gold-500 disabled:opacity-30"
              />
              <button
                onClick={() => onChange({ ...value, skillLevel: value.skillLevel === null ? 10 : null })}
                className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                  value.skillLevel === null ? 'bg-gold-500/20 text-gold-300' : 'bg-white/8 text-ink-300'
                }`}
              >
                Full
              </button>
            </div>
          </Row>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-ink-400">{label}</span>
        <span className="tabular-nums text-ink-200">{value}</span>
      </div>
      {children}
    </div>
  );
}
