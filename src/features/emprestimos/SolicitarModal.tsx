import { formatarData, hojeEmSaoPaulo, PRAZO_DIAS, somarDias } from '../../lib/datas';

/**
 * Spec 006 regra 8 / layout 5.6: modal de 420px. Clique no fundo fecha; clique
 * dentro não propaga (CA-20).
 */
export function SolicitarModal({
  nome,
  enviando,
  onCancelar,
  onConfirmar,
}: {
  nome: string;
  enviando: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const devolverAte = formatarData(somarDias(hojeEmSaoPaulo(), PRAZO_DIAS));
  return (
    <div
      data-testid="fundo-modal"
      onClick={onCancelar}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(10,11,18,0.68)]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-solicitar"
        onClick={(e) => e.stopPropagation()}
        className="flex w-[420px] animate-[fadeUp_.18s_ease_both] flex-col gap-4 rounded-lg border border-divider bg-surface p-[26px]"
      >
        <h2 id="titulo-solicitar" className="text-[20px]">
          Solicitar empréstimo
        </h2>
        <p className="text-[13.5px] text-text/62">
          O equipamento fica no seu nome a partir de hoje. Retire no balcão de Operações.
        </p>
        <dl className="flex flex-col gap-2 rounded-md border border-divider px-4 py-3.5 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <dt className="text-text/62">Equipamento</dt>
            <dd className="text-accent-400">{nome}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text/62">Devolver até</dt>
            <dd className="text-accent-400">{devolverAte}</dd>
          </div>
        </dl>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="h-9 cursor-pointer rounded-md border border-divider px-3.5 text-[13.5px] text-text hover:bg-text/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={enviando}
            onClick={onConfirmar}
            className="h-9 cursor-pointer rounded-md border border-accent-500 px-3.5 text-[13.5px] text-accent-300 hover:bg-[rgba(47,184,172,0.12)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
