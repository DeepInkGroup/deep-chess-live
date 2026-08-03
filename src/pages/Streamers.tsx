import { Radio } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getLiveStreamers } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';

export default function Streamers() {
  const { data, loading, error } = useAsync(() => getLiveStreamers(), []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Radio className="text-gold-400" /> Live Streamers
        </h1>
        <p className="mt-1 text-sm text-ink-400">Lichess streamers currently live.</p>
      </div>

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
            const link = s.streamer?.twitch ?? s.streamer?.youTube;
            const Wrapper = link ? 'a' : 'div';
            return (
              <Wrapper
                key={s.id}
                {...(link ? { href: link, target: '_blank', rel: 'noreferrer' } : {})}
                className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-ink-850/60 p-4 transition-colors hover:border-gold-500/30"
              >
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
                      {s.title && <span className="text-gold-400">{s.title}</span>} {s.streamer?.name ?? s.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-ruby-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-ruby-500" /> Live on {s.stream?.service ?? 'stream'}
                    </p>
                  </div>
                </div>
                {s.stream?.status && <p className="line-clamp-2 text-xs text-ink-400">{s.stream.status}</p>}
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
