import { signIn } from './features/auth/auth-api';
import { HomePage } from './features/auth/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { useSession } from './features/auth/useSession';
import type { Supabase } from './lib/supabase';

export function App({
  supabase,
  apiUrl,
}: {
  supabase: Supabase;
  apiUrl: string;
}) {
  const session = useSession(supabase);

  if (session.status === 'loading') {
    return <p className="m-6">Carregando…</p>;
  }
  if (session.status === 'signedIn') {
    return (
      <HomePage
        email={session.session.user.email ?? ''}
        apiUrl={apiUrl}
        onSignOut={() => void supabase.auth.signOut()}
      />
    );
  }
  return <LoginPage onSubmit={(credentials) => signIn(supabase, credentials)} />;
}
