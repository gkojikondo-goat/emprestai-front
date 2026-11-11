import { Navigate, Outlet, type RouteObject } from 'react-router';
import { Toast } from '../components/Toast';
import { signIn } from '../features/auth/auth-api';
import { LoginPage } from '../features/auth/LoginPage';
import { AreaLogada, EmConstrucao, SoOperacoes } from './AreaLogada';
import { useSessao } from './sessao';

function Raiz() {
  return (
    <>
      <Outlet />
      <Toast />
    </>
  );
}

/** Spec 003 CA-02: com sessão, /login leva ao catálogo. */
function RotaLogin() {
  const { supabase, estado } = useSessao();
  if (estado.status === 'loading') return <p className="m-6">Carregando…</p>;
  if (estado.status === 'signedIn') return <Navigate to="/catalogo" replace />;
  return <LoginPage onSubmit={(credenciais) => signIn(supabase, credenciais)} />;
}

/** Telas por rota. As specs 004 e 006 substituem catálogo e meus empréstimos. */
export type Telas = { catalogo: React.ReactNode; meusEmprestimos: React.ReactNode };

export function criarRotas(telas: Telas): RouteObject[] {
  return [
    {
      path: '/',
      element: <Raiz />,
      children: [
        { index: true, element: <Navigate to="/catalogo" replace /> },
        { path: 'login', element: <RotaLogin /> },
        {
          element: <AreaLogada />,
          children: [
            { path: 'catalogo', element: telas.catalogo },
            { path: 'meus-emprestimos', element: telas.meusEmprestimos },
            {
              path: 'operacoes',
              element: (
                <SoOperacoes>
                  <EmConstrucao titulo="Operações" />
                </SoOperacoes>
              ),
            },
            {
              path: 'equipamentos',
              element: (
                <SoOperacoes>
                  <EmConstrucao titulo="Equipamentos" />
                </SoOperacoes>
              ),
            },
            { path: '*', element: <Navigate to="/catalogo" replace /> },
          ],
        },
      ],
    },
  ];
}

export const TELAS_EM_CONSTRUCAO: Telas = {
  catalogo: <EmConstrucao titulo="Catálogo" />,
  meusEmprestimos: <EmConstrucao titulo="Meus empréstimos" />,
};
