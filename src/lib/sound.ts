const KEY = 'deepchess.soundEnabled.v1';
const STYLE_KEY = 'deepchess.soundStyle.v1';

export type SoundStyle = 'classic' | 'soft' | 'chime' | 'digital';

export const SOUND_STYLES: { id: SoundStyle; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'soft', label: 'Soft' },
  { id: 'chime', label: 'Chime' },
  { id: 'digital', label: 'Digital' },
];

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(KEY, enabled ? '1' : '0');
  } catch {
    /* localStorage unavailable */
  }
}

export function getSoundStyle(): SoundStyle {
  try {
    const v = localStorage.getItem(STYLE_KEY);
    return v && SOUND_STYLES.some((s) => s.id === v) ? (v as SoundStyle) : 'classic';
  } catch {
    return 'classic';
  }
}

export function setSoundStyle(style: SoundStyle) {
  try {
    localStorage.setItem(STYLE_KEY, style);
  } catch {
    /* localStorage unavailable */
  }
}

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function tone(freq: number, duration: number, delay = 0, gain = 0.08, type: OscillatorType = 'sine') {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  const start = ctx.currentTime + delay;
  osc.start(start);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.stop(start + duration);
}

const STYLE_PATTERNS: Record<SoundStyle, (capture: boolean) => void> = {
  classic: (capture) => {
    if (capture) {
      tone(220, 0.12);
      tone(160, 0.15, 0.03);
    } else {
      tone(520, 0.08);
    }
  },
  soft: (capture) => {
    if (capture) {
      tone(300, 0.16, 0, 0.05, 'triangle');
      tone(220, 0.18, 0.04, 0.05, 'triangle');
    } else {
      tone(440, 0.12, 0, 0.05, 'triangle');
    }
  },
  chime: (capture) => {
    if (capture) {
      tone(660, 0.1, 0, 0.06, 'triangle');
      tone(440, 0.16, 0.05, 0.06, 'triangle');
    } else {
      tone(660, 0.08, 0, 0.06, 'triangle');
      tone(880, 0.1, 0.06, 0.05, 'triangle');
    }
  },
  digital: (capture) => {
    if (capture) {
      tone(180, 0.08, 0, 0.05, 'square');
      tone(120, 0.1, 0.03, 0.05, 'square');
    } else {
      tone(760, 0.05, 0, 0.04, 'square');
    }
  },
};

export function playMoveSound(capture: boolean) {
  if (!isSoundEnabled()) return;
  STYLE_PATTERNS[getSoundStyle()](capture);
}

/** Plays a short preview of a given style, ignoring the enabled setting (used by the style picker). */
export function previewSoundStyle(style: SoundStyle) {
  STYLE_PATTERNS[style](false);
}
