import { NavLink } from 'react-router';
import { Brand } from '../components/Brand';
import type { MeDtoOutput } from '../lib/api/generated/api';

type Aba = { rota: string; rotulo: string };

const ABAS_COLABORADOR: Aba[] = [
  { rota: '/catalogo', rotulo: 'Catálogo' },
  { rota: '/meus-emprestimos', rotulo: 'Meus empréstimos' },
];

const ABAS_OPERACOES: Aba[] = [
  { rota: '/catalogo', rotulo: 'Catálogo' },
  { rota: '/operacoes', rotulo: 'Operações' },
  { rota: '/equipamentos', rotulo: 'Equipamentos' },
  { rota: '/meus-emprestimos', rotulo: 'Meus empréstimos' },
];

/** Spec 003 regra 2. Sem papel carregado, só as abas comuns (CA-12). */
export function abasDoPapel(papel: MeDtoOutput['papel'] | undefined): Aba[] {
  return papel === 'operacoes' ? ABAS_OPERACOES : ABAS_COLABORADOR;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

/** Layout 6: barra sticky de 60px, abas, papel, avatar, nome e Sair. */
export function NavBar({ me, onSair }: { me: MeDtoOutput | undefined; onSair: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center gap-8 border-b border-divider bg-bg px-10">
      <Brand tamanho="barra" />
      <nav aria-label="Principal" className="flex h-full">
        {abasDoPapel(me?.papel).map((aba) => (
          <NavLink
            key={aba.rota}
            to={aba.rota}
            className={({ isActive }) =>
              `flex h-full items-center border-b-2 px-3.5 text-[13.5px] ${
                isActive ? 'border-accent-500 text-text' : 'border-transparent text-text/55 hover:text-text/80'
              }`
            }
          >
            {aba.rotulo}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3 text-[13.5px]">
        {me && (
          <>
            <span className="rounded-full border border-divider px-2.5 py-0.5 text-[12px] text-text/70">
              {me.papel === 'operacoes' ? 'Operações' : 'Colaborador'}
            </span>
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-700 bg-accent-900 text-[11.5px] font-semibold text-accent-300"
            >
              {iniciais(me.nome)}
            </span>
            <span>{me.nome}</span>
          </>
        )}
        <button
          type="button"
          onClick={onSair}
          className="h-9 cursor-pointer rounded-md border border-divider bg-transparent px-3.5 text-text hover:bg-text/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
