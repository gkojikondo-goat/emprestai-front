import { Link } from 'react-router';
import { formatarData } from '../../lib/datas';
import { useMeusEmprestimos } from './useMeusEmprestimos';

/**
 * Spec 006 regra 11 (emenda da prática): versão mínima de Meus empréstimos.
 * Devolver, estados de prazo e a barra de 3 traços ficam para a spec 007.
 */
export function MeusEmprestimosPage() {
  const meus = useMeusEmprestimos();
  const itens = meus.data?.itens ?? [];
  const limite = meus.data?.limite ?? 3;

  return (
    <main className="mx-auto flex max-w-[1000px] flex-col gap-5 px-10 pb-16 pt-9">
      <header>
        <h1 className="text-[30px]">Meus empréstimos</h1>
        {meus.data && (
          <p className="mt-1 text-sm text-text/55">
            {itens.length} de {limite} itens em seu nome · prazo padrão de 14 dias
          </p>
        )}
      </header>

      {meus.isPending ? (
        <p className="text-text/55">Carregando empréstimos…</p>
      ) : meus.isError ? (
        <p role="alert">Não foi possível carregar seus empréstimos.</p>
      ) : itens.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-divider p-12">
          <p className="text-text/72">Nenhum empréstimo em aberto.</p>
          <Link
            to="/catalogo"
            className="h-9 rounded-md border border-accent-500 px-3.5 text-[13.5px] leading-9 text-accent-300"
          >
            Ir ao catálogo
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {itens.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-5 rounded-md border border-divider bg-surface px-5 py-[18px] text-[13.5px]"
            >
              <div className="flex-[1.4]">
                <p className="text-[16px]">{e.equipamento.nome}</p>
                <p className="text-[12px] text-text/45">{e.equipamento.patrimonio ?? 'TI-—'}</p>
              </div>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.08em] text-text/45">Retirada</p>
                <p>{formatarData(e.retiradaEm)}</p>
              </div>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.08em] text-text/45">Devolver até</p>
                {/* Cor por estado do prazo é da spec 007 (regra 11 da 006). */}
                <p>{formatarData(e.devolverAte)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
