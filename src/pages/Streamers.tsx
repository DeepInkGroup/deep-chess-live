import { useState } from 'react';
import { ExternalLink, Radio, X } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getLiveStreamers } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';

function twitchChannelFromUrl(url: string): string | null {
  const match = url.match(/twitch\.tv\/([A-Za-z0-9_]+)/);
  return match ? match[1] : null;
}

export default function Streamers() {
  const { data, loading, error } = useAsync(() => getLiveStreamers(), []);
  const [activeChannel, setActiveChannel] = useState<{ name: string; channel: string } | null>(null);

  const parentParams = [window.location.hostname, 'localhost'].filter((h, i, arr) => arr.indexOf(h) === i).map((h) => `parent=${h}`).join('&');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Radio className="text-gold-400" /> Live Streamers
        </h1>
        <p className="mt-1 text-sm text-ink-400">Lichess streamers currently live.</p>
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

      {loading && <LoadingBlock label="Finding live streamers…" />}
      {error && <ErrorBlock message="Couldn't load streamers." />}

      {data && data.length === 0 && (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">
          No one is streaming right now. Check back later.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => {
            const twitchUrl = s.streamer?.twitch;
            const twitchChannel = twitchUrl ? twitchChannelFromUrl(twitchUrl) : null;
            const link = twitchUrl ?? s.streamer?.youTube;
            const name = s.streamer?.name ?? s.name;

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
                    </p>
                  </div>
                </div>
                {s.stream?.status && <p className="line-clamp-2 text-xs text-ink-400">{s.stream.status}</p>}
                {twitchChannel && (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-ink-300">
                    Click to watch here
                  </span>
                )}
              </>
            );

            if (twitchChannel) {
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveChannel({ name, channel: twitchChannel })}
                  className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-ink-850/60 p-4 text-left transition-colors hover:border-gold-500/30"
                >
                  {card}
                </button>
              );
            }

            return (
              <a
                key={s.id}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-ink-850/60 p-4 transition-colors hover:border-gold-500/30"
              >
                {card}
                {link && (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-ink-500">
                    Open stream <ExternalLink size={10} />
                  </span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
