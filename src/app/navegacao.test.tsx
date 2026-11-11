import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DURACAO_TOAST_MS, Toast, useToast } from '../components/Toast';
import { abrir, ME_COLABORADOR, ME_OPERACOES } from '../test/dubles';

const comMe = (me: unknown) => ({ 'GET /v1/me': { status: 200, corpo: me } });

function nomesDasAbas() {
  const nav = screen.getByRole('navigation', { name: 'Principal' });
  return within(nav)
    .getAllByRole('link')
    .map((a) => a.textContent);
}

describe('003 · navegação por papel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('[003 CA-01] sem sessão, qualquer rota que não seja /login leva a /login', async () => {
    for (const rota of ['/', '/catalogo', '/meus-emprestimos', '/operacoes', '/equipamentos']) {
      const { router, unmount } = abrir(rota, { logado: false });
      await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
      unmount();
    }
  });

  it('[003 CA-02] com sessão, /login e / levam a /catalogo', async () => {
    for (const rota of ['/login', '/']) {
      const { router, unmount } = abrir(rota, { api: comMe(ME_COLABORADOR) });
      await waitFor(() => expect(router.state.location.pathname).toBe('/catalogo'));
      unmount();
    }
  });

  it('[003 CA-03] Colaborador vê exatamente Catálogo e Meus empréstimos', async () => {
    abrir('/catalogo', { api: comMe(ME_COLABORADOR) });
    await screen.findByText('Ana Ribeiro');
    expect(nomesDasAbas()).toEqual(['Catálogo', 'Meus empréstimos']);
  });

  it('[003 CA-04] Operações vê Catálogo, Operações, Equipamentos e Meus empréstimos, nessa ordem', async () => {
    abrir('/catalogo', { api: comMe(ME_OPERACOES) });
    await screen.findByText('Otávio Lima');
    expect(nomesDasAbas()).toEqual(['Catálogo', 'Operações', 'Equipamentos', 'Meus empréstimos']);
  });

  it('[003 CA-05] Colaborador que abre /operacoes ou /equipamentos vai para /catalogo', async () => {
    for (const rota of ['/operacoes', '/equipamentos']) {
      const { router, unmount } = abrir(rota, { api: comMe(ME_COLABORADOR) });
      await waitFor(() => expect(router.state.location.pathname).toBe('/catalogo'));
      unmount();
    }
  });

  it('[003 CA-06] a aba da rota atual tem a borda no acento; as outras ficam a 55%', async () => {
    abrir('/meus-emprestimos', { api: comMe(ME_COLABORADOR) });
    await screen.findByText('Ana Ribeiro');
    const ativa = screen.getByRole('link', { name: 'Meus empréstimos' });
    const inativa = screen.getByRole('link', { name: 'Catálogo' });
    expect(ativa.className).toMatch(/border-accent-500/);
    expect(ativa.className).toMatch(/(^|\s)border-b-2(\s|$)/);
    expect(ativa.getAttribute('aria-current')).toBe('page');
    expect(inativa.className).toMatch(/text-text\/55/);
    expect(inativa.className).toMatch(/border-transparent/);
  });

  it('[003 CA-07] a barra mostra papel, iniciais, nome e Sair (Operações)', async () => {
    abrir('/catalogo', { api: comMe(ME_OPERACOES) });
    expect(await screen.findByText('Otávio Lima')).toBeDefined();
    expect(screen.getByText('Operações', { selector: 'span' })).toBeDefined();
    expect(screen.getByText('OL')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeDefined();
  });

  it('[003 CA-07] a barra mostra papel, iniciais, nome e Sair (Colaborador)', async () => {
    abrir('/catalogo', { api: comMe(ME_COLABORADOR) });
    expect(await screen.findByText('Ana Ribeiro')).toBeDefined();
    expect(screen.getByText('Colaborador', { selector: 'span' })).toBeDefined();
    expect(screen.getByText('AR')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeDefined();
  });

  it('[003 CA-08] Sair encerra a sessão e leva a /login', async () => {
    const { router, supabase } = abrir('/catalogo', { api: comMe(ME_COLABORADOR) });
    fireEvent.click(await screen.findByRole('button', { name: 'Sair' }));
    await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalled());
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
  });

  it('[003 CA-09] a Vercel serve o index.html em qualquer rota (rewrite de SPA)', () => {
    const vercel = JSON.parse(readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf8'));
    expect(vercel.rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }]);
  });

  it('[003 CA-10] as quatro telas sem spec mostram o título e "Em construção."', async () => {
    const telas: [string, string][] = [
      ['/catalogo', 'Catálogo'],
      ['/meus-emprestimos', 'Meus empréstimos'],
      ['/operacoes', 'Operações'],
      ['/equipamentos', 'Equipamentos'],
    ];
    for (const [rota, titulo] of telas) {
      const { unmount } = abrir(rota, { api: comMe(ME_OPERACOES) });
      expect(await screen.findByRole('heading', { name: titulo })).toBeDefined();
      expect(screen.getByText('Em construção.')).toBeDefined();
      unmount();
    }
  });

  it('[003 CA-13] com sessão, rota desconhecida leva a /catalogo', async () => {
    const { router } = abrir('/nao-existe', { api: comMe(ME_COLABORADOR) });
    await waitFor(() => expect(router.state.location.pathname).toBe('/catalogo'));
  });

  it('[003 CA-11] o Toast aparece centralizado a 28px da base e some em 2600ms', () => {
    vi.useFakeTimers();
    render(<Toast />);
    act(() => useToast.getState().mostrar('Empréstimo solicitado.'));
    const toast = screen.getByRole('status');
    expect(toast.textContent).toBe('Empréstimo solicitado.');
    expect(toast.className).toMatch(/bottom-\[28px\]/);
    expect(toast.className).toMatch(/left-1\/2/);
    expect(toast.className).toMatch(/-translate-x-1\/2/);
    expect(DURACAO_TOAST_MS).toBe(2600);
    act(() => vi.advanceTimersByTime(2599));
    expect(screen.queryByRole('status')).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('[003 CA-12] enquanto /v1/me não respondeu, a barra não mostra abas de Operações', async () => {
    let responder: (() => void) | undefined;
    const pronto = new Promise<void>((r) => (responder = r));
    const { chamadas } = abrir('/catalogo', {
      api: {
        'GET /v1/me': async () => {
          await pronto;
          return { status: 200, corpo: ME_OPERACOES };
        },
      },
    });
    // A barra já apareceu, /v1/me foi chamado e ainda não respondeu: só as abas comuns.
    await screen.findByRole('navigation', { name: 'Principal' });
    await waitFor(() => expect(chamadas.some((c) => c.url === '/v1/me')).toBe(true));
    expect(nomesDasAbas()).toEqual(['Catálogo', 'Meus empréstimos']);
    responder?.();
    await screen.findByText('Otávio Lima');
    expect(nomesDasAbas()).toEqual(['Catálogo', 'Operações', 'Equipamentos', 'Meus empréstimos']);
  });
});
