import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../lib/sound';

export default function SoundToggle() {
  const [on, setOn] = useState(isSoundEnabled);

  function toggle() {
    const next = !on;
    setSoundEnabled(next);
    setOn(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={on ? 'Mute move sounds' : 'Enable move sounds'}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        on ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
      }`}
    >
      {on ? <Volume2 size={15} /> : <VolumeX size={15} />}
    </button>
  );
}
