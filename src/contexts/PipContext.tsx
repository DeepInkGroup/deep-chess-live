import { createContext, useContext, useState } from 'react';

export type PipTarget = { kind: 'tv'; channel: string; label: string } | { kind: 'game'; gameId: string; label: string };

interface PipContextValue {
  target: PipTarget | null;
  openPip: (target: PipTarget) => void;
  closePip: () => void;
}

const PipContext = createContext<PipContextValue | null>(null);

export function PipProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<PipTarget | null>(null);
  return <PipContext.Provider value={{ target, openPip: setTarget, closePip: () => setTarget(null) }}>{children}</PipContext.Provider>;
}

export function usePip(): PipContextValue {
  const ctx = useContext(PipContext);
  if (!ctx) return { target: null, openPip: () => {}, closePip: () => {} };
  return ctx;
}
