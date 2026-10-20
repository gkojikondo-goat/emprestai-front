import { HomePage } from './features/auth/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { useSession } from './features/auth/useSession';
import type { Supabase } from './lib/supabase';

export function App({ supabase }: { supabase: Supabase }) {
  const session = useSession(supabase);

  if (session.status === 'loading') {
    return <p className="m-6">Carregando…</p>;
  }
  return session.status === 'signedIn' ? <HomePage /> : <LoginPage />;
}
