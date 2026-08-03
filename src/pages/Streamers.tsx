import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Play, Radio, Search, X } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getLiveStreamers, getUser } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import type { LichessStreamer } from '../types/lichess';

function twitchChannelFromUrl(url: string): string | null {
  const match = url.match(/twitch\.tv\/([A-Za-z0-9_]+)/);
  return match ? match[1] : null;
}

/** Lichess's `playing` field is a path like "/abcdefgh" or "/abcdefgh/black"; pull out just the game id. */
function extractGameId(path: string): string {
  const match = path.match(/([A-Za-z0-9]{8,12})/);
  return match ? match[1] : path.replace(/^\/+/, '').split('/')[0];
}

let langDisplay: Intl.DisplayNames | null = null;
try {
  langDisplay = new Intl.DisplayNames(['en'], { type: 'language' });
} catch {
  langDisplay = null;
}
function langLabel(code: string): string {
  const base = code.split('-')[0];
  try {
    return langDisplay?.of(base) ?? code;
  } catch {
    return code;
  }
}

/** Fetches each streamer's Lichess user status so we can surface a "playing now" link when applicable. */
function usePlayingStatus(streamers: LichessStreamer[] | null) {
  const [playing, setPlaying] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!streamers || streamers.length === 0) return;
    let cancelled = false;
    Promise.all(
      streamers.map(async (s) => {
        try {
          const user = await getUser(s.id);
          return [s.id, user.playing] as const;
        } catch {
          return [s.id, undefined] as const;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const [id, url] of results) {
        if (url) map[id] = url;
      }
      setPlaying(map);
    });
    return () => {
      cancelled = true;
    };
  }, [streamers]);

  return playing;
}

export default function Streamers() {
  const { data, loading, error } = useAsync(() => getLiveStreamers(), []);
  const [activeChannel, setActiveChannel] = useState<{ name: string; channel: string } | null>(null);
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('all');
  const playing = usePlayingStatus(data);

  const parentParams = [window.location.hostname, 'localhost'].filter((h, i, arr) => arr.indexOf(h) === i).map((h) => `parent=${h}`).join('&');

  const languages = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.map((s) => s.stream?.lang).filter((l): l is string => !!l));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data
      .filter((s) => {
        if (lang !== 'all' && s.stream?.lang !== lang) return false;
        if (q) {
          const name = (s.streamer?.name ?? s.name).toLowerCase();
          if (!name.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (!!a.title !== !!b.title) return a.title ? -1 : 1;
        return 0;
      });
  }, [data, query, lang]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Radio className="text-gold-400" /> Live Streamers
        </h1>
        <p className="mt-1 text-sm text-ink-400">Lichess streamers currently live, titled players first.</p>
      </div>

      {activeChannel && (
        <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-ink-100">{activeChannel.name}</p>
            <button onClick={() => setActiveChannel(null)} aria-label="Close player" className="text-ink-400 hover:text-ink-100">
              <X size={16} />
            </button>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              src={`https://player.twitch.tv/?channel=${activeChannel.channel}&${parentParams}&muted=true`}
              className="h-full w-full"
              allowFullScreen
              title={`${activeChannel.name} Twitch stream`}
            />
          </div>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
            <Search size={14} className="text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search streamers…"
              className="w-40 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
            />
          </div>
          {languages.length > 1 && (
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
            >
              <option value="all" className="bg-ink-900">
                All languages
              </option>
              {languages.map((l) => (
                <option key={l} value={l} className="bg-ink-900">
                  {langLabel(l)}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {loading && <LoadingBlock label="Finding live streamers…" />}
      {error && <ErrorBlock message="Couldn't load streamers." />}

      {data && data.length === 0 && (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">
          No one is streaming right now. Check back later.
        </p>
      )}

      {data && data.length > 0 && filtered.length === 0 && (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">No streamers match your filters.</p>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const twitchUrl = s.streamer?.twitch;
            const twitchChannel = twitchUrl ? twitchChannelFromUrl(twitchUrl) : null;
            const link = twitchUrl ?? s.streamer?.youTube;
            const name = s.streamer?.name ?? s.name;
            const liveGamePath = playing[s.id];

            const card = (
              <>
                <div className="flex items-center gap-3">
                  {s.streamer?.image ? (
                    <img src={s.streamer.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-ink-400">
                      <Radio size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate font-semibold text-ink-100">
                      {s.title && <span className="text-gold-400">{s.title}</span>} {name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-ruby-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-ruby-500" /> Live on {s.stream?.service ?? 'stream'}
                      {s.stream?.lang && <span className="text-ink-500">· {langLabel(s.stream.lang)}</span>}
                    </p>
                  </div>
                </div>
                {s.stream?.status && <p className="line-clamp-2 text-xs text-ink-400">{s.stream.status}</p>}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {twitchChannel && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-ink-300">
                      Click to watch here
                    </span>
                  )}
                  {liveGamePath && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-400">
                      <Play size={10} /> Playing now
                    </span>
                  )}
                </div>
              </>
            );

            return (
              <div key={s.id} className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-ink-850/60 p-4 transition-colors hover:border-gold-500/30">
                {twitchChannel ? (
                  <button onClick={() => setActiveChannel({ name, channel: twitchChannel })} className="flex flex-col gap-2 text-left">
                    {card}
                  </button>
                ) : (
                  <a href={link} target="_blank" rel="noreferrer" className="flex flex-col gap-2">
                    {card}
                    {link && (
                      <span className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-ink-500">
                        Open stream <ExternalLink size={10} />
                      </span>
                    )}
                  </a>
                )}
                {liveGamePath && (
                  <Link
                    to={`/watch/${extractGameId(liveGamePath)}`}
                    className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                  >
                    <Play size={12} /> Watch their live game
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
