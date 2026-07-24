function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.28 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center text-xs text-ink-400 sm:px-6">
        <p>
          Live data from{' '}
          <a href="https://lichess.org" target="_blank" rel="noreferrer" className="text-ink-300 underline decoration-white/20 underline-offset-2 hover:text-gold-400">
            Lichess.org
          </a>{' '}
          and{' '}
          <a href="https://www.chess.com" target="_blank" rel="noreferrer" className="text-ink-300 underline decoration-white/20 underline-offset-2 hover:text-gold-400">
            Chess.com
          </a>{' '}
          public APIs. Not affiliated with either.
        </p>
        <a
          href="https://github.com/DeepInkGroup"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-ink-300 transition-colors hover:text-gold-400"
        >
          <GithubIcon />
          DeepInk Group
        </a>
      </div>
    </footer>
  );
}
