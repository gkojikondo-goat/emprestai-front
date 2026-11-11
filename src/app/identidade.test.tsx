import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { abrir, ME_COLABORADOR } from '../test/dubles';
import { MENSAGEM_SEM_VINCULO } from './AreaLogada';

describe('002 · identidade no front', () => {
  it('[002 CA-12] depois do login chama GET /v1/me com o token e mostra o nome', async () => {
    const { chamadas } = abrir('/catalogo', { api: { 'GET /v1/me': { status: 200, corpo: ME_COLABORADOR } } });
    expect(await screen.findByText('Ana Ribeiro')).toBeDefined();
    const me = chamadas.find((c) => c.url === '/v1/me');
    expect(me?.auth).toBe('Bearer token-teste');
  });

  it('[002 CA-13] com 403 mostra a mensagem de conta sem vínculo e o botão Sair', async () => {
    abrir('/catalogo', {
      api: { 'GET /v1/me': { status: 403, corpo: { type: 'about:blank', title: 'Forbidden', status: 403 } } },
    });
    expect(await screen.findByText(MENSAGEM_SEM_VINCULO)).toBeDefined();
    expect(MENSAGEM_SEM_VINCULO).toBe(
      'Sua conta ainda não está vinculada a uma área. Fale com Operações.',
    );
    expect(screen.getByRole('button', { name: 'Sair' })).toBeDefined();
  });

  it('[002 CA-14] qualquer 401 encerra a sessão e volta ao Login', async () => {
    const { supabase, router } = abrir('/catalogo', {
      api: { 'GET /v1/me': { status: 401, corpo: { type: 'about:blank', title: 'Unauthorized', status: 401 } } },
    });
    await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalled());
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeDefined();
  });
});
