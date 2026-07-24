import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Crown size={40} className="text-gold-400" />
      <h1 className="font-display text-2xl font-semibold text-ink-100">Page not found</h1>
      <p className="text-sm text-ink-400">This square is empty. Let's get you back to the board.</p>
      <Link to="/" className="mt-2 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400">
        Back home
      </Link>
    </div>
  );
}
