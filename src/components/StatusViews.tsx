import { AlertTriangle, Loader2 } from 'lucide-react';

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400">
      <Loader2 className="animate-spin text-gold-400" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorBlock({ message = 'Something went wrong.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-ruby-500/20 bg-ruby-500/5 py-16 text-center">
      <AlertTriangle className="text-ruby-400" size={26} />
      <p className="max-w-sm text-sm text-ink-300">{message}</p>
    </div>
  );
}
