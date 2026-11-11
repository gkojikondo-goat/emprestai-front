import { useQueryClient } from '@tanstack/react-query';
import { Navigate, Outlet, useOutletContext } from 'react-router';
import { useMe } from '../features/auth/useMe';
import type { MeDtoOutput } from '../lib/api/generated/api';
import { ErroApi } from '../lib/api/http';
import { NavBar } from './NavBar';
import { useSessao } from './sessao';

/** Spec 002 CA-13: token válido mas sem vínculo com um tenant. */
export const MENSAGEM_SEM_VINCULO =
  'Sua conta ainda não está vinculada a uma área. Fale com Operações.';

export function useMeLogado(): MeDtoOutput | undefined {
  return useOutletContext<MeDtoOutput | undefined>();
}

/**
 * Tudo que exige sessão (spec 003 CA-01). Carrega /v1/me; enquanto carrega, a
 * barra mostra só as abas comuns (CA-12).
 */
export function AreaLogada() {
  const { supabase, estado } = useSessao();
  const queryClient = useQueryClient();
  const me = useMe(estado.status === 'signedIn' ? estado.session.user.id : undefined);
  if (estado.status === 'loading') return <p className="m-6">Carregando…</p>;
  if (estado.status === 'signedOut') return <Navigate to="/login" replace />;

  // Spec 003 CA-08: Sair encerra a sessão; o cache da pessoa anterior é descartado.
  const sair = () => {
    queryClient.clear();
    void supabase.auth.signOut();
  };

  if (me.error instanceof ErroApi && me.error.status === 403) {
    return (
      <div className="min-h-[820px]">
        <NavBar me={undefined} onSair={sair} />
        <main className="mx-auto max-w-[1000px] px-10 pb-16 pt-9">
          <p role="alert" className="rounded-lg border border-divider bg-surface p-[18px] text-text/72">
            {MENSAGEM_SEM_VINCULO}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[820px]">
      <NavBar me={me.data} onSair={sair} />
      <Outlet context={me.data} />
    </div>
  );
}

/** Spec 003 regra 3: rota de Operações; Colaborador volta para o catálogo. */
export function SoOperacoes({ children }: { children: React.ReactNode }) {
  const me = useMeLogado();
  if (!me) return null;
  if (me.papel !== 'operacoes') return <Navigate to="/catalogo" replace />;
  return <>{children}</>;
}

/** Spec 003 regra 5: tela sem spec implementada. */
export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <main className="mx-auto max-w-[1240px] px-10 pb-16 pt-9">
      <h1 className="text-[30px]">{titulo}</h1>
      <p className="mt-1 text-sm text-text/55">Em construção.</p>
    </main>
  );
}
