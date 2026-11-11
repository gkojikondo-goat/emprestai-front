import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import {
  listarEquipamentos,
  type ListarEquipamentosSituacao,
} from '../../lib/api/generated/api';

export type Filtro = 'todos' | ListarEquipamentosSituacao;

/** Estado de UI do catálogo (ADR-001: Zustand para estado de cliente). */
export const useFiltrosCatalogo = create<{
  busca: string;
  filtro: Filtro;
  setBusca: (b: string) => void;
  setFiltro: (f: Filtro) => void;
}>((set) => ({
  busca: '',
  filtro: 'todos',
  setBusca: (busca) => set({ busca }),
  setFiltro: (filtro) => set({ filtro }),
}));

/** Spec 004: lista paginada por cursor, refeita ao voltar para a aba (regra 14). */
export function useEquipamentos(busca: string, filtro: Filtro) {
  return useInfiniteQuery({
    queryKey: ['equipamentos', busca, filtro],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      (
        await listarEquipamentos({
          q: busca || undefined,
          situacao: filtro === 'todos' ? undefined : filtro,
          cursor: pageParam,
          limite: 50,
        })
      ).data,
    getNextPageParam: (ultima) => ultima.proximoCursor,
    // Mantém o resultado anterior enquanto a busca nova carrega (plano 004).
    placeholderData: keepPreviousData,
  });
}
