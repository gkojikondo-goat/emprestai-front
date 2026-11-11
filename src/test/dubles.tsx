import type { Session } from '@supabase/supabase-js';
import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { App, criarQueryClient } from '../App';
import { criarRotas, TELAS_EM_CONSTRUCAO, type Telas } from '../app/rotas';
import { configurarApi } from '../lib/api/http';
import type { Supabase } from '../lib/supabase';

/** Supabase de mentira: sessão em memória, sem rede. */
export function supabaseFalso(logado: boolean, userId = '11111111-1111-4111-8111-111111111111') {
  let sessao: Session | null = logado
    ? ({ access_token: 'token-teste', user: { id: userId, email: 'ana@teste.dev' } } as Session)
    : null;
  const ouvintes = new Set<(e: string, s: Session | null) => void>();
  const auth = {
    getSession: vi.fn(async () => ({ data: { session: sessao }, error: null })),
    onAuthStateChange: vi.fn((fn: (e: string, s: Session | null) => void) => {
      ouvintes.add(fn);
      return { data: { subscription: { unsubscribe: () => ouvintes.delete(fn) } } };
    }),
    signOut: vi.fn(async () => {
      sessao = null;
      ouvintes.forEach((fn) => fn('SIGNED_OUT', null));
      return { error: null };
    }),
    signInWithPassword: vi.fn(),
  };
  return { auth } as unknown as Supabase & { auth: typeof auth };
}

type Resposta = { status: number; corpo?: unknown };

/**
 * fetch de mentira por rota ("GET /v1/me"). Configura o cliente da API como em
 * produção (main.tsx), inclusive o tratamento de 401.
 */
export function apiFalsa(supabase: Supabase, rotas: Record<string, Resposta | (() => Resposta | Promise<Resposta>)>) {
  const chamadas: { metodo: string; url: string; auth: string | null; corpo: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const metodo = init.method ?? 'GET';
      const caminho = url.replace('http://api.teste', '').split('?')[0];
      const headers = new Headers(init.headers);
      chamadas.push({
        metodo,
        url: url.replace('http://api.teste', ''),
        auth: headers.get('Authorization'),
        corpo: init.body ? JSON.parse(String(init.body)) : undefined,
      });
      const r = rotas[`${metodo} ${caminho}`];
      const resp = typeof r === 'function' ? await r() : (r ?? { status: 404, corpo: { title: 'Not Found' } });
      return new Response(resp.corpo === undefined ? '' : JSON.stringify(resp.corpo), {
        status: resp.status,
      });
    }),
  );
  const queryClient = criarQueryClient();
  configurarApi({
    baseUrl: 'http://api.teste',
    obterToken: async () => (await supabase.auth.getSession()).data.session?.access_token,
    aoNaoAutorizado: () => {
      queryClient.clear();
      void supabase.auth.signOut();
    },
  });
  return { chamadas, queryClient };
}

export const ME_COLABORADOR = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'ana@teste.dev',
  nome: 'Ana Ribeiro',
  tenant: { id: '22222222-2222-4222-8222-222222222222', slug: 'suporte_ti' },
  papel: 'colaborador',
};

export const ME_OPERACOES = { ...ME_COLABORADOR, nome: 'Otávio Lima', papel: 'operacoes' };

/** Monta a aplicação inteira numa rota, com dublês de Supabase e API. */
export function abrir(
  rota: string,
  opcoes: {
    logado?: boolean;
    api?: Record<string, Resposta | (() => Resposta | Promise<Resposta>)>;
    telas?: Telas;
  } = {},
) {
  const supabase = supabaseFalso(opcoes.logado ?? true);
  const { chamadas, queryClient } = apiFalsa(supabase, opcoes.api ?? {});
  const router = createMemoryRouter(criarRotas(opcoes.telas ?? TELAS_EM_CONSTRUCAO), {
    initialEntries: [rota],
  });
  const tela = render(
    <App supabase={supabase} queryClient={queryClient} router={router as never} />,
  );
  return { ...tela, router, supabase, chamadas, queryClient };
}
