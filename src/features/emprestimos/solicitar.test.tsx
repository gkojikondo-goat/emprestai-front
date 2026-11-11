import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErroApi } from '../../lib/api/http';
import { abrir, ME_COLABORADOR } from '../../test/dubles';
import { CatalogoPage } from '../catalogo/CatalogoPage';
import { useFiltrosCatalogo } from '../catalogo/useEquipamentos';
import { MeusEmprestimosPage } from './MeusEmprestimosPage';
import { motivoDaRecusa } from './regras';

const TELAS = { catalogo: <CatalogoPage />, meusEmprestimos: <MeusEmprestimosPage /> };
const ME = { 'GET /v1/me': { status: 200, corpo: ME_COLABORADOR } };
const DISPONIVEL = { id: 'e1', nome: 'Notebook 14 polegadas', categoria: 'notebook', patrimonio: 'TI-0001', situacao: 'disponivel', observacao: null, imagemUrl: null, emprestimo: null };
const OUTRO = { ...DISPONIVEL, id: 'e2', nome: 'Monitor 24 polegadas', patrimonio: 'TI-0005' };
const lista = (itens: unknown[]) => ({ status: 200, corpo: { itens, totais: { total: itens.length, disponiveis: itens.length } } });
const meus = (itens: unknown[] = [], bloqueado = false) => ({ status: 200, corpo: { itens, limite: 3, bloqueado } });
const aberto = (id: string, devolverAte = '2026-11-20', emAtraso = false) => ({
  id: `emp-${id}`,
  equipamento: { id, nome: `Item ${id}`, patrimonio: `TI-${id}` },
  retiradaEm: '2026-11-06',
  devolverAte,
  emAtraso,
});

const card = (nome: string) => screen.getByRole('article', { name: nome });
const botaoDe = (nome: string) => within(card(nome)).getByRole('button') as HTMLButtonElement;

describe('006 · solicitar empréstimo no front', () => {
  beforeEach(() => {
    useFiltrosCatalogo.setState({ busca: '', filtro: 'todos' });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-10T15:00:00Z')); // 10/11 em São Paulo
  });
  afterEach(() => vi.useRealTimers());

  it('[006 CA-14] o modal mostra o equipamento e "Devolver até" = hoje + 14 dias em DD/MM/AAAA', async () => {
    abrir('/catalogo', { telas: TELAS, api: { ...ME, 'GET /v1/emprestimos/meus': meus(), 'GET /v1/equipamentos': lista([DISPONIVEL]) } });
    await screen.findByText('Notebook 14 polegadas');
    fireEvent.click(await waitFor(() => botaoDe('Notebook 14 polegadas')));
    const modal = within(screen.getByRole('dialog', { name: 'Solicitar empréstimo' }));
    expect(modal.getByText('Notebook 14 polegadas')).toBeDefined();
    expect(modal.getByText('24/11/2026')).toBeDefined();
  });

  it('[006 CA-15] confirmar chama a API, fecha o modal, mostra o toast e o card vira "Está com você"', async () => {
    let pedido = false;
    const { chamadas } = abrir('/catalogo', {
      telas: TELAS,
      api: {
        ...ME,
        'GET /v1/emprestimos/meus': () => meus(pedido ? [aberto('e1', '2026-11-24')] : []),
        'GET /v1/equipamentos': () =>
          lista([
            pedido
              ? { ...DISPONIVEL, situacao: 'emprestado', emprestimo: { pessoaNome: 'Ana Ribeiro', devolverAte: '2026-11-24', comigo: true } }
              : DISPONIVEL,
          ]),
        'POST /v1/emprestimos': () => {
          pedido = true;
          return { status: 201, corpo: { id: 'emp', equipamentoId: 'e1', userId: ME_COLABORADOR.id, retiradaEm: '2026-11-10', devolverAte: '2026-11-24' } };
        },
      },
    });
    await screen.findByText('Notebook 14 polegadas');
    await waitFor(() => expect(botaoDe('Notebook 14 polegadas').disabled).toBe(false));
    fireEvent.click(botaoDe('Notebook 14 polegadas'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByRole('status')).toHaveProperty('textContent', 'Empréstimo solicitado.');
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(botaoDe('Notebook 14 polegadas').textContent).toBe('Está com você'));
    expect(chamadas.find((c) => c.metodo === 'POST')?.corpo).toEqual({ equipamentoId: 'e1' });
  });

  it('[006 CA-16] com 3 em aberto, todo "Solicitar" vira "Limite de 3 itens", desabilitado e secundário', async () => {
    abrir('/catalogo', {
      telas: TELAS,
      api: { ...ME, 'GET /v1/emprestimos/meus': meus([aberto('1'), aberto('2'), aberto('3')]), 'GET /v1/equipamentos': lista([DISPONIVEL, OUTRO]) },
    });
    await screen.findByText('Monitor 24 polegadas');
    await waitFor(() => expect(botaoDe('Notebook 14 polegadas').textContent).toBe('Limite de 3 itens'));
    for (const n of ['Notebook 14 polegadas', 'Monitor 24 polegadas']) {
      expect(botaoDe(n).textContent).toBe('Limite de 3 itens');
      expect(botaoDe(n).disabled).toBe(true);
      expect(botaoDe(n).dataset.estilo).toBe('secundario');
    }
  });

  it('[006 CA-17] com item em atraso, os botões mostram "Bloqueado por atraso", desabilitados', async () => {
    abrir('/catalogo', {
      telas: TELAS,
      api: { ...ME, 'GET /v1/emprestimos/meus': meus([aberto('1', '2026-11-01', true)], true), 'GET /v1/equipamentos': lista([DISPONIVEL, OUTRO]) },
    });
    await screen.findByText('Monitor 24 polegadas');
    await waitFor(() => expect(botaoDe('Notebook 14 polegadas').textContent).toBe('Bloqueado por atraso'));
    expect(botaoDe('Monitor 24 polegadas').disabled).toBe(true);
  });

  it('[006 CA-18] com item em atraso aparece o banner com atalho para /meus-emprestimos', async () => {
    const { router } = abrir('/catalogo', {
      telas: TELAS,
      api: { ...ME, 'GET /v1/emprestimos/meus': meus([aberto('1', '2026-11-01', true)], true), 'GET /v1/equipamentos': lista([DISPONIVEL]) },
    });
    const banner = await screen.findByRole('alert');
    expect(banner.textContent).toMatch(/item em atraso/);
    fireEvent.click(within(banner).getByRole('link', { name: 'Ver meus empréstimos' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/meus-emprestimos'));
  });

  it('[006 CA-19] erro 409 da API fecha o modal, mostra a mensagem em toast e refaz o catálogo', async () => {
    const { chamadas } = abrir('/catalogo', {
      telas: TELAS,
      api: {
        ...ME,
        'GET /v1/emprestimos/meus': meus(),
        'GET /v1/equipamentos': lista([DISPONIVEL]),
        'POST /v1/emprestimos': { status: 409, corpo: { type: 'equipamento-indisponivel', title: 'Equipamento indisponível', status: 409, detail: 'x' } },
      },
    });
    await screen.findByText('Notebook 14 polegadas');
    await waitFor(() => expect(botaoDe('Notebook 14 polegadas').disabled).toBe(false));
    const antes = chamadas.filter((c) => c.url.startsWith('/v1/equipamentos')).length;
    fireEvent.click(botaoDe('Notebook 14 polegadas'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect((await screen.findByRole('status')).textContent).toBe('Este equipamento acabou de ser emprestado.');
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(chamadas.filter((c) => c.url.startsWith('/v1/equipamentos')).length).toBeGreaterThan(antes));
  });

  it('[006 CA-20] Cancelar e clique fora fecham sem chamar a API; clique dentro não fecha', async () => {
    const { chamadas } = abrir('/catalogo', { telas: TELAS, api: { ...ME, 'GET /v1/emprestimos/meus': meus(), 'GET /v1/equipamentos': lista([DISPONIVEL]) } });
    await screen.findByText('Notebook 14 polegadas');
    await waitFor(() => expect(botaoDe('Notebook 14 polegadas').disabled).toBe(false));
    fireEvent.click(botaoDe('Notebook 14 polegadas'));
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(botaoDe('Notebook 14 polegadas'));
    fireEvent.click(screen.getByTestId('fundo-modal'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(chamadas.some((c) => c.metodo === 'POST')).toBe(false);
  });

  it('[006 CA-21] /meus-emprestimos mostra "N de 3 itens..." e cada empréstimo com nome, patrimônio, Retirada e Devolver até', async () => {
    abrir('/meus-emprestimos', { telas: TELAS, api: { ...ME, 'GET /v1/emprestimos/meus': meus([aberto('0001', '2026-11-20'), aberto('0002', '2026-11-24')]) } });
    expect(await screen.findByText('2 de 3 itens em seu nome · prazo padrão de 14 dias')).toBeDefined();
    const linhas = screen.getAllByRole('listitem');
    expect(linhas).toHaveLength(2);
    const l = within(linhas[0] as HTMLElement);
    expect(l.getByText('Item 0001')).toBeDefined();
    expect(l.getByText('TI-0001')).toBeDefined();
    expect(l.getByText('Retirada')).toBeDefined();
    expect(l.getByText('06/11/2026')).toBeDefined();
    expect(l.getByText('Devolver até')).toBeDefined();
    expect(l.getByText('20/11/2026')).toBeDefined();
  });

  it('[006 CA-22] sem empréstimos: "Nenhum empréstimo em aberto." e "Ir ao catálogo" leva a /catalogo', async () => {
    const { router } = abrir('/meus-emprestimos', { telas: TELAS, api: { ...ME, 'GET /v1/emprestimos/meus': meus(), 'GET /v1/equipamentos': lista([]) } });
    expect(await screen.findByText('Nenhum empréstimo em aberto.')).toBeDefined();
    fireEvent.click(screen.getByRole('link', { name: 'Ir ao catálogo' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/catalogo'));
  });

  it('[006 CA-23] o toast de recusa traz o motivo de cada type', () => {
    const erro = (tipo: string) => new ErroApi(422, tipo, 't', 'detalhe da API');
    expect(motivoDaRecusa(erro('limite-de-itens'))).toBe('Você já tem 3 itens emprestados.');
    expect(motivoDaRecusa(erro('bloqueado-por-atraso'))).toBe('Você tem um item em atraso. Devolva-o antes de pedir outro.');
    expect(motivoDaRecusa(erro('equipamento-indisponivel'))).toBe('Este equipamento acabou de ser emprestado.');
    expect(motivoDaRecusa(erro('equipamento-em-manutencao'))).toBe('Este equipamento está em manutenção.');
    expect(motivoDaRecusa(erro('outro'))).toBe('detalhe da API');
  });
});
