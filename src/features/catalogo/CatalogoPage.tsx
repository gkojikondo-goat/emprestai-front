import { useState } from 'react';
import { Link } from 'react-router';
import { useToast } from '../../components/Toast';
import type { ListaEquipamentosDtoOutputItensItem as Equipamento } from '../../lib/api/generated/api';
import { motivoDaRecusa } from '../emprestimos/regras';
import { SolicitarModal } from '../emprestimos/SolicitarModal';
import { useMeusEmprestimos, useSolicitar } from '../emprestimos/useMeusEmprestimos';
import { EquipamentoCard } from './EquipamentoCard';
import { type Filtro, useEquipamentos, useFiltrosCatalogo } from './useEquipamentos';

const CHIPS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'disponivel', rotulo: 'Disponíveis' },
  { valor: 'emprestado', rotulo: 'Emprestados' },
  { valor: 'manutencao', rotulo: 'Em manutenção' },
];

/** Spec 004 (catálogo) + spec 006 (solicitar). Layout 5.2. */
export function CatalogoPage() {
  const { busca, filtro, setBusca, setFiltro } = useFiltrosCatalogo();
  const lista = useEquipamentos(busca, filtro);
  const meus = useMeusEmprestimos();
  const solicitar = useSolicitar();
  const mostrarToast = useToast((s) => s.mostrar);
  const [escolhido, setEscolhido] = useState<Equipamento | null>(null);

  const paginas = lista.data?.pages ?? [];
  const itens = paginas.flatMap((p) => p.itens);
  const totais = paginas[0]?.totais;

  async function confirmar() {
    if (!escolhido) return;
    try {
      await solicitar.mutateAsync(escolhido.id);
      mostrarToast('Empréstimo solicitado.');
    } catch (erro) {
      // Spec 006 CA-19 e CA-23: fecha, mostra o motivo e o catálogo é refeito.
      mostrarToast(motivoDaRecusa(erro));
    } finally {
      setEscolhido(null);
    }
  }

  return (
    <main className="mx-auto flex max-w-[1240px] flex-col gap-5 px-10 pb-16 pt-9">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px]">Catálogo</h1>
          {totais && (
            <p className="mt-1 text-sm text-text/55">
              {totais.disponiveis} de {totais.total} equipamentos disponíveis agora
            </p>
          )}
        </div>
        <input
          type="search"
          aria-label="Buscar por nome ou patrimônio"
          placeholder="Buscar por nome ou patrimônio"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="h-9 w-[260px] rounded-md border border-divider bg-surface px-2.5 text-[13.5px] text-text placeholder:text-text/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        />
      </header>

      {meus.data?.bloqueado && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-[#7a3b3b] bg-[rgba(122,59,59,0.14)] px-4 py-3 text-[13.5px] text-[#e88b8b]"
        >
          <span>Você tem um item em atraso. Devolva-o para voltar a pedir equipamentos.</span>
          <Link to="/meus-emprestimos" className="underline">
            Ver meus empréstimos
          </Link>
        </div>
      )}

      <div role="group" aria-label="Filtrar por situação" className="flex flex-wrap gap-2">
        {CHIPS.map((c) => {
          const ativo = filtro === c.valor;
          return (
            <button
              key={c.valor}
              type="button"
              aria-pressed={ativo}
              onClick={() => setFiltro(c.valor)}
              className={`h-8 cursor-pointer rounded-full border px-3.5 text-[13px] ${
                ativo ? 'border-accent-500 bg-[rgba(47,184,172,0.10)] text-accent-400' : 'border-divider text-text/70'
              }`}
            >
              {c.rotulo}
            </button>
          );
        })}
      </div>

      {lista.isPending ? (
        <p className="text-text/55">Carregando catálogo…</p>
      ) : lista.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert">Não foi possível carregar o catálogo.</p>
          <button
            type="button"
            onClick={() => void lista.refetch()}
            className="h-9 cursor-pointer rounded-md border border-divider px-3.5 text-[13.5px]"
          >
            Tentar novamente
          </button>
        </div>
      ) : itens.length === 0 ? (
        <p className="text-text/55">Nenhum equipamento encontrado.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] gap-4">
          {itens.map((item) => (
            <EquipamentoCard key={item.id} item={item} meus={meus.data} onSolicitar={setEscolhido} />
          ))}
        </div>
      )}

      {lista.hasNextPage && (
        <button
          type="button"
          onClick={() => void lista.fetchNextPage()}
          disabled={lista.isFetchingNextPage}
          className="h-9 cursor-pointer self-center rounded-md border border-divider px-3.5 text-[13.5px]"
        >
          Carregar mais
        </button>
      )}

      {/* Spec 004 regra 16 / CA-22: crédito exigido pelo contrato da skill. */}
      <p className="text-[12px] text-text/40">
        Fotos:{' '}
        <a href="https://pixabay.com" target="_blank" rel="noreferrer" className="underline">
          Pixabay
        </a>
      </p>

      {escolhido && (
        <SolicitarModal
          nome={escolhido.nome}
          enviando={solicitar.isPending}
          onCancelar={() => setEscolhido(null)}
          onConfirmar={() => void confirmar()}
        />
      )}
    </main>
  );
}
