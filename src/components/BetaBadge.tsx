export default function BetaBadge({ label = 'Beta feature — still rough around the edges' }: { label?: string }) {
  return (
    <span
      title={label}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-[10px] font-bold text-gold-400"
    >
      B
    </span>
  );
}
