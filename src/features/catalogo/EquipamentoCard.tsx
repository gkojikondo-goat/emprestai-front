import type {
  ListaEquipamentosDtoOutputItensItem as Equipamento,
  MeusEmprestimosDtoOutput as Meus,
} from '../../lib/api/generated/api';
import { formatarData } from '../../lib/datas';
import { botaoDoCard } from '../emprestimos/regras';

/** Layout 1: cores semânticas de situação (fg, bg, bd). */
export const CORES_SITUACAO = {
  disponivel: { rotulo: 'Disponível', fg: '#5fcfc4', bg: 'rgba(47,184,172,0.12)', bd: 'rgba(47,184,172,0.40)' },
  emprestado: { rotulo: 'Emprestado', fg: '#c9a25f', bg: 'rgba(201,162,95,0.12)', bd: 'rgba(201,162,95,0.38)' },
  manutencao: { rotulo: 'Em manutenção', fg: '#9aa0ad', bg: 'rgba(154,160,173,0.10)', bd: 'rgba(154,160,173,0.30)' },
} as const;

export function SituacaoPill({ situacao }: { situacao: Equipamento['situacao'] }) {
  const c = CORES_SITUACAO[situacao];
  return (
    <span
      data-situacao={situacao}
      className="shrink-0 rounded-full border px-[9px] py-[3px] text-[12px]"
      style={{ color: c.fg, background: c.bg, borderColor: c.bd }}
    >
      {c.rotulo}
    </span>
  );
}

/** Spec 004 regra 11: a linha de detalhe muda com a situação. */
export function detalheDoCard(item: Equipamento): string {
  if (item.situacao === 'disponivel') return 'Pronto para retirada no balcão';
  if (item.situacao === 'emprestado' && item.emprestimo) {
    return `Com ${item.emprestimo.pessoaNome} · devolver até ${formatarData(item.emprestimo.devolverAte)}`;
  }
  return item.observacao ?? '';
}

const ROTULO_CATEGORIA: Record<string, string> = {
  notebook: 'Notebook',
  monitor: 'Monitor',
  cabo: 'Cabo',
  camera: 'Câmera',
  acessorio: 'Acessório',
};

export function EquipamentoCard({
  item,
  meus,
  onSolicitar,
}: {
  item: Equipamento;
  meus: Meus | undefined;
  onSolicitar: (item: Equipamento) => void;
}) {
  const botao = botaoDoCard(item, meus);
  return (
    <article
      aria-label={item.nome}
      className="flex animate-[fadeUp_.25s_ease_both] flex-col gap-3 overflow-hidden rounded-lg border border-divider bg-surface"
    >
      {/* Spec 004 CA-21: foto 800×600 em 4:3; sem foto, quadro neutro do mesmo tamanho. */}
      {item.imagemUrl ? (
        <img src={item.imagemUrl} alt={item.nome} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div data-testid="sem-foto" aria-hidden="true" className="aspect-[4/3] w-full bg-text/5" />
      )}
      <div className="flex flex-col gap-3 px-[18px] pb-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.09em] text-text/45">
              {ROTULO_CATEGORIA[item.categoria] ?? item.categoria}
            </p>
            <h2 className="mt-1 text-[16.5px]">{item.nome}</h2>
            <p className="text-[12px] text-text/45">{item.patrimonio ?? 'TI-—'}</p>
          </div>
          <SituacaoPill situacao={item.situacao} />
        </div>
        <p className="min-h-[18px] text-[13px] text-text/55">{detalheDoCard(item)}</p>
        <button
          type="button"
          disabled={!botao.habilitado}
          data-estilo={botao.estilo}
          onClick={() => onSolicitar(item)}
          className={`h-9 w-full rounded-md border px-3.5 text-[13.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:cursor-not-allowed disabled:opacity-45 ${
            botao.estilo === 'primario'
              ? 'cursor-pointer border-accent-500 text-accent-300 hover:bg-[rgba(47,184,172,0.12)]'
              : 'border-divider text-text'
          }`}
        >
          {botao.texto}
        </button>
      </div>
    </article>
  );
}
