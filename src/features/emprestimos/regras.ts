import type {
  ListaEquipamentosDtoOutputItensItem as Equipamento,
  MeusEmprestimosDtoOutput as Meus,
} from '../../lib/api/generated/api';
import { ErroApi } from '../../lib/api/http';

/** Spec 006 CA-23: motivo da recusa a partir do `type` do Problem Details. */
const MOTIVOS: Record<string, string> = {
  'limite-de-itens': 'Você já tem 3 itens emprestados.',
  'bloqueado-por-atraso': 'Você tem um item em atraso. Devolva-o antes de pedir outro.',
  'equipamento-indisponivel': 'Este equipamento acabou de ser emprestado.',
  'equipamento-em-manutencao': 'Este equipamento está em manutenção.',
};

export function motivoDaRecusa(erro: unknown): string {
  if (erro instanceof ErroApi) return MOTIVOS[erro.tipo] ?? erro.detalhe ?? 'Não foi possível solicitar.';
  return 'Não foi possível solicitar. Tente novamente.';
}

export type Botao = { texto: string; habilitado: boolean; estilo: 'primario' | 'secundario' };

/**
 * Rótulo e estado do botão do card (spec 004 regra 12 e spec 006 regra 9).
 * Ordem: situação do item; depois, para item disponível, atraso e limite da pessoa.
 */
export function botaoDoCard(item: Equipamento, meus: Meus | undefined): Botao {
  if (item.situacao === 'manutencao') return { texto: 'Indisponível', habilitado: false, estilo: 'secundario' };
  if (item.situacao === 'emprestado') {
    return {
      texto: item.emprestimo?.comigo ? 'Está com você' : 'Emprestado',
      habilitado: false,
      estilo: 'secundario',
    };
  }
  if (meus?.bloqueado) return { texto: 'Bloqueado por atraso', habilitado: false, estilo: 'secundario' };
  if (meus && meus.itens.length > meus.limite) {
    return { texto: `Limite de ${meus.limite} itens`, habilitado: false, estilo: 'secundario' };
  }
  return { texto: 'Solicitar', habilitado: true, estilo: 'primario' };
}
