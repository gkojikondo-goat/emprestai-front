import { createContext, useContext, type ReactNode } from 'react';
import { useSession, type SessionState } from '../features/auth/useSession';
import type { Supabase } from '../lib/supabase';

type Sessao = { supabase: Supabase; estado: SessionState };

const SessaoContext = createContext<Sessao | undefined>(undefined);

export function ProvedorSessao({ supabase, children }: { supabase: Supabase; children: ReactNode }) {
  const estado = useSession(supabase);
  return <SessaoContext.Provider value={{ supabase, estado }}>{children}</SessaoContext.Provider>;
}

export function useSessao(): Sessao {
  const s = useContext(SessaoContext);
  if (!s) throw new Error('useSessao fora de ProvedorSessao');
  return s;
}
