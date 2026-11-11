import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { App, criarQueryClient } from './App';
import { criarRotas } from './app/rotas';
import { loadEnv } from './config/env';
import { CatalogoPage } from './features/catalogo/CatalogoPage';
import { MeusEmprestimosPage } from './features/emprestimos/MeusEmprestimosPage';
import './index.css';
import { configurarApi } from './lib/api/http';
import { createSupabase } from './lib/supabase';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Elemento #root não encontrado em index.html');
}

function render() {
  try {
    const env = loadEnv();
    const supabase = createSupabase(env);
    const queryClient = criarQueryClient();
    configurarApi({
      baseUrl: env.apiUrl,
      obterToken: async () => (await supabase.auth.getSession()).data.session?.access_token,
      // Spec 002 CA-14: qualquer 401 encerra a sessão e volta ao Login.
      aoNaoAutorizado: () => {
        queryClient.clear();
        void supabase.auth.signOut();
      },
    });
    const router = createBrowserRouter(
      criarRotas({ catalogo: <CatalogoPage />, meusEmprestimos: <MeusEmprestimosPage /> }),
    );
    return <App supabase={supabase} queryClient={queryClient} router={router} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <p role="alert" className="m-6 whitespace-pre-line">
        {message}
      </p>
    );
  }
}

createRoot(root).render(<StrictMode>{render()}</StrictMode>);
