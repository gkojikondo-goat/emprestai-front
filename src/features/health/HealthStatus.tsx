import { useEffect, useState } from 'react';
import { fetchHealth, type Health } from './health-api';

type State =
  | { phase: 'loading' }
  | { phase: 'ready'; health: Health }
  | { phase: 'error'; message: string };

export function HealthStatus({ apiUrl }: { apiUrl: string }) {
  const [state, setState] = useState<State>({ phase: 'loading' });

  useEffect(() => {
    let active = true;
    fetchHealth(apiUrl)
      .then((health) => active && setState({ phase: 'ready', health }))
      .catch((error: unknown) => {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Erro desconhecido.';
        setState({ phase: 'error', message });
      });
    return () => {
      active = false;
    };
  }, [apiUrl]);

  if (state.phase === 'loading') {
    return <p>Verificando a API…</p>;
  }
  if (state.phase === 'error') {
    return <p role="alert">Não foi possível consultar a API: {state.message}</p>;
  }
  return (
    <dl>
      <dt>API</dt>
      <dd>{state.health.status}</dd>
      <dt>Banco</dt>
      <dd>{state.health.database}</dd>
    </dl>
  );
}
