import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meusEmprestimos, solicitarEmprestimo } from '../../lib/api/generated/api';

export const CHAVE_MEUS = ['emprestimos', 'meus'] as const;

/** Spec 006 regra 6: empréstimos em aberto de quem está logado. */
export function useMeusEmprestimos() {
  return useQuery({
    queryKey: CHAVE_MEUS,
    queryFn: async () => (await meusEmprestimos()).data,
  });
}

/** Spec 006 regra 10 e CA-19: depois de pedir (deu certo ou não), refaz catálogo e meus. */
export function useSolicitar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (equipamentoId: string) => (await solicitarEmprestimo({ equipamentoId })).data,
    onSettled: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['equipamentos'] }),
        qc.invalidateQueries({ queryKey: CHAVE_MEUS }),
      ]);
    },
  });
}
