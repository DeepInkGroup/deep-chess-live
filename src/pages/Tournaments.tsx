import { Trophy } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getTournaments } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import TournamentCard from '../components/TournamentCard';

export default function Tournaments() {
  const { data, loading, error } = useAsync(() => getTournaments(), []);

  if (loading) return <LoadingBlock label="Fetching tournaments…" />;
  if (error || !data) return <ErrorBlock message="Couldn't load tournaments." />;

  const started = data.started;
  const created = [...data.created].sort((a, b) => a.startsAt - b.startsAt).slice(0, 18);
  const finished = data.finished.slice(0, 12);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Trophy className="text-gold-400" /> Tournaments
        </h1>
        <p className="mt-1 text-sm text-ink-400">Live and upcoming Lichess arena tournaments. Pick one to see standings, or join it on Lichess.</p>
      </div>

      {started.length > 0 && (
        <Section title={`Live now (${started.length})`}>
          {started.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </Section>
      )}

      <Section title="Starting soon">
        {created.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </Section>

      {finished.length > 0 && (
        <Section title="Recently finished">
          {finished.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
