interface DayActivity {
  date: string;
  count: number;
}

function levelClass(count: number): string {
  if (count === 0) return 'bg-white/5';
  if (count === 1) return 'bg-gold-500/30';
  if (count === 2) return 'bg-gold-500/55';
  if (count === 3) return 'bg-gold-500/80';
  return 'bg-gold-400';
}

export default function PuzzleHeatmap({ data }: { data: DayActivity[] }) {
  const totalDays = data.length;
  const leadingBlanks = data.length ? new Date(data[0].date).getDay() : 0;
  const cells: (DayActivity | null)[] = [...Array(leadingBlanks).fill(null), ...data];
  const weeks: (DayActivity | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  title={`${day.date}: ${day.count} solved`}
                  className={`h-3 w-3 rounded-sm ${levelClass(day.count)}`}
                />
              ) : (
                <div key={di} className="h-3 w-3" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-ink-500">
        <span>{totalDays} days</span>
        <span className="flex items-center gap-1">
          Less
          <span className="h-2.5 w-2.5 rounded-sm bg-white/5" />
          <span className="h-2.5 w-2.5 rounded-sm bg-gold-500/30" />
          <span className="h-2.5 w-2.5 rounded-sm bg-gold-500/55" />
          <span className="h-2.5 w-2.5 rounded-sm bg-gold-400" />
          More
        </span>
      </div>
    </div>
  );
}
