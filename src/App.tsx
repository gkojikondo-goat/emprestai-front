import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, type createBrowserRouter } from 'react-router';
import { ProvedorSessao } from './app/sessao';
import type { Supabase } from './lib/supabase';

type Router = ReturnType<typeof createBrowserRouter>;

/** Raiz da aplicação: sessão do Supabase, cache do TanStack Query e rotas. */
export function App({
  supabase,
  queryClient,
  router,
}: {
  supabase: Supabase;
  queryClient: QueryClient;
  router: Router;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorSessao supabase={supabase}>
        <RouterProvider router={router} />
      </ProvedorSessao>
    </QueryClientProvider>
  );
}

/** ADR-001 / spec 004 regra 14: refaz os dados ao voltar para a aba. */
export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: true, retry: false } },
  });
}
