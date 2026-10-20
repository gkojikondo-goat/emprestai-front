import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import type { Supabase } from '../../lib/supabase';

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; session: Session };

function toState(session: Session | null): SessionState {
  return session ? { status: 'signedIn', session } : { status: 'signedOut' };
}

export function useSession(supabase: Supabase): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState(toState(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState(toState(session));
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}
