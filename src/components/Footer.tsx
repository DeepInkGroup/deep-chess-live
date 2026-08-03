function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.28 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function TelegramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.05 3.16 2.9 10.24c-1.24.5-1.23 1.19-.23 1.5l4.65 1.45 1.8 5.5c.22.6.11.84.75.84.5 0 .72-.23 1-.5l2.4-2.33 4.7 3.47c.87.48 1.5.23 1.72-.8l3.1-14.6c.3-1.26-.48-1.83-1.74-1.31Zm-11.4 11.02 8.9-8.04c.42-.36-.09-.56-.65-.2L8.02 13.4l-.32 4.5-.05-.32-1-.68Z" />
    </svg>
  );
}

const APP_VERSION = 'V 1.2.0';

export default function Footer() {
  return (
    <footer className="pb-safe border-t border-white/5 py-6">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 text-xs text-ink-400 sm:px-6">
        <span className="text-left">{APP_VERSION}</span>
        <span className="text-center font-medium text-ink-300">DeepInk Group</span>
        <div className="flex items-center justify-end gap-4">
          <a
            href="https://t.me/DeepInkGroup"
            target="_blank"
            rel="noreferrer"
            aria-label="DeepInk Group on Telegram"
            className="text-ink-300 transition-colors hover:text-gold-400"
          >
            <TelegramIcon />
          </a>
          <a
            href="https://github.com/DeepInkGroup"
            target="_blank"
            rel="noreferrer"
            aria-label="DeepInk Group on GitHub"
            className="text-ink-300 transition-colors hover:text-gold-400"
          >
            <GithubIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
