import { useQuery } from '@tanstack/react-query';
import { obterMe, type MeDtoOutput } from '../../lib/api/generated/api';

/**
 * Spec 002 CA-12: quem está logado, com papel e tenant, vindo de GET /v1/me.
 * A chave inclui a pessoa da sessão: trocar de conta nunca reaproveita o papel anterior.
 */
export function useMe(userId: string | undefined) {
  return useQuery<MeDtoOutput>({
    queryKey: ['me', userId],
    queryFn: async () => (await obterMe()).data,
    enabled: Boolean(userId),
    retry: false,
    staleTime: 5 * 60_000,
  });
}
