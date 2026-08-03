import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

const DISMISS_KEY = 'deepchess.installPromptDismissedAt.v1';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SNOOZE_MS;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* localStorage unavailable */
  }
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || isDismissedRecently()) return;

    const ua = navigator.userAgent;
    const iOSDevice = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
    setIsIOS(iOSDevice);
    if (iOSDevice) setVisible(true);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function handleDismiss() {
    dismiss();
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-[95] flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-ink-850 p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
          <Download size={16} />
        </div>
        <div className="min-w-0 flex-1 text-xs text-ink-300">
          {isIOS ? (
            <p>
              Install DeepChess: tap <Share size={11} className="inline align-text-bottom" /> then{' '}
              <span className="font-semibold text-ink-100">Add to Home Screen</span>.
            </p>
          ) : (
            <p className="font-semibold text-ink-100">Install DeepChess Live for quick access and a full-screen board.</p>
          )}
        </div>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-gold-400"
          >
            Install
          </button>
        )}
        <button onClick={handleDismiss} aria-label="Dismiss" className="shrink-0 text-ink-500 hover:text-ink-200">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
