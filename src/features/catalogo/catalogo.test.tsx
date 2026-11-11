import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { abrir, ME_COLABORADOR } from '../../test/dubles';
import { MeusEmprestimosPage } from '../emprestimos/MeusEmprestimosPage';
import { CatalogoPage } from './CatalogoPage';
import { useFiltrosCatalogo } from './useEquipamentos';

const TELAS = { catalogo: <CatalogoPage />, meusEmprestimos: <MeusEmprestimosPage /> };
const FOTO = 'https://x.supabase.co/storage/v1/object/public/equipamentos/TI-0001.jpg';

export const ITENS = [
  { id: 'a1', nome: 'Notebook 14 polegadas', categoria: 'notebook', patrimonio: 'TI-0001', situacao: 'disponivel', observacao: null, imagemUrl: FOTO, emprestimo: null },
  { id: 'a2', nome: 'Monitor 22 polegadas', categoria: 'monitor', patrimonio: 'TI-0007', situacao: 'manutencao', observacao: 'Painel com falha', imagemUrl: null, emprestimo: null },
  { id: 'a3', nome: 'Câmera compacta', categoria: 'camera', patrimonio: 'TI-0012', situacao: 'emprestado', observacao: null, imagemUrl: null, emprestimo: { pessoaNome: 'Otávio Lima', devolverAte: '2026-11-24', comigo: false } },
  { id: 'a4', nome: 'Webcam Full HD', categoria: 'camera', patrimonio: null, situacao: 'emprestado', observacao: null, imagemUrl: null, emprestimo: { pessoaNome: 'Ana Ribeiro', devolverAte: '2026-11-20', comigo: true } },
];
const TOTAIS = { total: 12, disponiveis: 9 };
const ME = { 'GET /v1/me': { status: 200, corpo: ME_COLABORADOR } };
const SEM_EMPRESTIMOS = { 'GET /v1/emprestimos/meus': { status: 200, corpo: { itens: [], limite: 3, bloqueado: false } } };

function lista(itens = ITENS, extra: Record<string, unknown> = {}) {
  return { status: 200, corpo: { itens, totais: TOTAIS, ...extra } };
}

const card = (nome: string) => screen.getByRole('article', { name: nome });

describe('004 · catálogo no front', () => {
  beforeEach(() => useFiltrosCatalogo.setState({ busca: '', filtro: 'todos' }));

  it('[004 CA-11] cabeçalho "Catálogo" e "X de Y equipamentos disponíveis agora" vindos de totais', async () => {
    abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    expect(await screen.findByRole('heading', { name: 'Catálogo', level: 1 })).toBeDefined();
    expect(await screen.findByText('9 de 12 equipamentos disponíveis agora')).toBeDefined();
  });

  it('[004 CA-12] card com categoria, nome, patrimônio (ou TI-—), pill nas cores do layout e linha de detalhe', async () => {
    abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    await screen.findByText('Notebook 14 polegadas');
    const nb = within(card('Notebook 14 polegadas'));
    expect(nb.getByText('Notebook')).toBeDefined();
    expect(nb.getByText('TI-0001')).toBeDefined();
    expect(nb.getByText('Disponível').getAttribute('style')).toMatch(/color: rgb\(95, 207, 196\)/);
    expect(nb.getByText('Pronto para retirada no balcão')).toBeDefined();
    const cam = within(card('Câmera compacta'));
    expect(cam.getByText('Emprestado', { selector: 'span' }).getAttribute('style')).toMatch(/color: rgb\(201, 162, 95\)/);
    expect(cam.getByText('Com Otávio Lima · devolver até 24/11/2026')).toBeDefined();
    expect(within(card('Webcam Full HD')).getByText('TI-—')).toBeDefined();
  });

  it('[004 CA-13] chips exclusivos; o ativo tem borda e texto no acento e fundo 0.10', async () => {
    const { chamadas } = abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    await screen.findByText('Notebook 14 polegadas');
    fireEvent.click(screen.getByRole('button', { name: 'Emprestados' }));
    await waitFor(() => expect(chamadas.some((c) => c.url.includes('situacao=emprestado'))).toBe(true));
    const pressionados = screen.getAllByRole('button', { pressed: true });
    expect(pressionados.map((b) => b.textContent)).toEqual(['Emprestados']);
    expect(pressionados[0]?.className).toMatch(/border-accent-500/);
    expect(pressionados[0]?.className).toMatch(/bg-\[rgba\(47,184,172,0\.10\)\]/);
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getAllByRole('button', { pressed: true }).map((b) => b.textContent)).toEqual(['Todos']);
  });

  it('[004 CA-14] a busca filtra enquanto se digita; sem resultado mostra "Nenhum equipamento encontrado."', async () => {
    const { chamadas } = abrir('/catalogo', {
      telas: TELAS,
      api: {
        ...ME,
        ...SEM_EMPRESTIMOS,
        'GET /v1/equipamentos': () => (chamadas.at(-1)?.url.includes('q=zzz') ? lista([]) : lista()),
      },
    });
    await screen.findByText('Notebook 14 polegadas');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(await screen.findByText('Nenhum equipamento encontrado.')).toBeDefined();
    expect(chamadas.some((c) => c.url.includes('q=zzz'))).toBe(true);
  });

  it('[004 CA-15] rótulos: manutenção "Indisponível", emprestado a outra pessoa "Emprestado", comigo "Está com você"', async () => {
    abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    await screen.findByText('Notebook 14 polegadas');
    const botao = (nome: string) => within(card(nome)).getByRole('button');
    expect(botao('Monitor 22 polegadas').textContent).toBe('Indisponível');
    expect(botao('Câmera compacta').textContent).toBe('Emprestado');
    expect(botao('Webcam Full HD').textContent).toBe('Está com você');
    for (const n of ['Monitor 22 polegadas', 'Câmera compacta', 'Webcam Full HD']) {
      expect((botao(n) as HTMLButtonElement).disabled).toBe(true);
    }
    expect(botao('Notebook 14 polegadas').textContent).toBe('Solicitar');
  });

  it('[004 CA-16] manutenção: pill cinza, mostra a observação e o chip Disponíveis pede só disponíveis', async () => {
    const { chamadas } = abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    await screen.findByText('Monitor 22 polegadas');
    const mon = within(card('Monitor 22 polegadas'));
    expect(mon.getByText('Em manutenção').getAttribute('style')).toMatch(/color: rgb\(154, 160, 173\)/);
    expect(mon.getByText('Painel com falha')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Disponíveis' }));
    await waitFor(() => expect(chamadas.some((c) => c.url.includes('situacao=disponivel'))).toBe(true));
  });

  it('[004 CA-17] carregando mostra "Carregando catálogo…"; erro mostra a mensagem e "Tentar novamente" refaz', async () => {
    let falhar = true;
    const { chamadas } = abrir('/catalogo', {
      telas: TELAS,
      api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': () => (falhar ? { status: 500, corpo: { title: 'x' } } : lista()) },
    });
    expect(await screen.findByText('Carregando catálogo…')).toBeDefined();
    expect(await screen.findByText('Não foi possível carregar o catálogo.')).toBeDefined();
    falhar = false;
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Notebook 14 polegadas')).toBeDefined();
    expect(chamadas.filter((c) => c.url.startsWith('/v1/equipamentos')).length).toBeGreaterThanOrEqual(2);
  });

  it('[004 CA-18] com proximoCursor aparece "Carregar mais", que acrescenta a próxima página', async () => {
    const { chamadas } = abrir('/catalogo', {
      telas: TELAS,
      api: {
        ...ME,
        ...SEM_EMPRESTIMOS,
        'GET /v1/equipamentos': () =>
          chamadas.at(-1)?.url.includes('cursor=c2') ? lista(ITENS.slice(2)) : lista(ITENS.slice(0, 2), { proximoCursor: 'c2' }),
      },
    });
    await screen.findByText('Notebook 14 polegadas');
    expect(screen.queryByText('Câmera compacta')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
    expect(await screen.findByText('Câmera compacta')).toBeDefined();
    expect(screen.getByText('Notebook 14 polegadas')).toBeDefined();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull());
  });

  it('[004 CA-19] datas em DD/MM/AAAA', async () => {
    abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    expect(await screen.findByText(/devolver até 24\/11\/2026/)).toBeDefined();
  });

  it('[004 CA-21] foto em 4:3 com alt igual ao nome; sem imagemUrl, quadro neutro', async () => {
    abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    const img = (await screen.findByAltText('Notebook 14 polegadas')) as HTMLImageElement;
    expect(img.src).toBe(FOTO);
    expect(img.className).toMatch(/aspect-\[4\/3\]/);
    const semFoto = within(card('Monitor 22 polegadas')).getByTestId('sem-foto');
    expect(semFoto.className).toMatch(/aspect-\[4\/3\]/);
  });

  it('[004 CA-22] o catálogo mostra "Fotos: Pixabay" com link para https://pixabay.com', async () => {
    abrir('/catalogo', { telas: TELAS, api: { ...ME, ...SEM_EMPRESTIMOS, 'GET /v1/equipamentos': lista() } });
    const link = await screen.findByRole('link', { name: 'Pixabay' });
    expect(link.getAttribute('href')).toBe('https://pixabay.com');
    expect(link.parentElement?.textContent).toBe('Fotos: Pixabay');
  });
});
