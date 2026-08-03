const KEY = 'deepchess.soundEnabled.v1';

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

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function tone(freq: number, duration: number, delay = 0, gain = 0.08) {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  const start = ctx.currentTime + delay;
  osc.start(start);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.stop(start + duration);
}

export function playMoveSound(capture: boolean) {
  if (!isSoundEnabled()) return;
  if (capture) {
    tone(220, 0.12);
    tone(160, 0.15, 0.03);
  } else {
    tone(520, 0.08);
  }
}
