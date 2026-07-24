import { Radio } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getBroadcastTop } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import BroadcastCard from '../components/BroadcastCard';

export default function Broadcasts() {
  const { data, loading, error } = useAsync(() => getBroadcastTop(), []);

  if (loading) return <LoadingBlock label="Fetching broadcasts…" />;
  if (error || !data) return <ErrorBlock message="Couldn't load broadcasts." />;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Radio className="text-gold-400" /> Broadcasts
        </h1>
        <p className="mt-1 text-sm text-ink-400">Official Lichess broadcasts of top-level chess events, with live boards for every game.</p>
      </div>

      {data.active.length > 0 && (
        <Section title={`Live now (${data.active.length})`}>
          {data.active.slice(0, 12).map((item) => (
            <BroadcastCard key={item.round.id} item={item} live />
          ))}
        </Section>
      )}

      {data.upcoming.length > 0 && (
        <Section title="Upcoming">
          {data.upcoming.slice(0, 12).map((item) => (
            <BroadcastCard key={item.round.id} item={item} />
          ))}
        </Section>
      )}

      {data.past.length > 0 && (
        <Section title="Recently finished">
          {data.past.slice(0, 12).map((item) => (
            <BroadcastCard key={item.round.id} item={item} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
