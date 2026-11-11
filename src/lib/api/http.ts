/**
 * Fetcher usado pelo cliente gerado (orval mutator). Anexa o token da sessão,
 * aponta para a URL da API e, em 401, encerra a sessão (spec 002 CA-14).
 */
export type ConfigApi = {
  baseUrl: string;
  obterToken: () => Promise<string | undefined>;
  aoNaoAutorizado: () => void;
};

let config: ConfigApi | undefined;

export function configurarApi(nova: ConfigApi): void {
  config = nova;
}

/** Erro da API em Problem Details (RFC 9457). */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly tipo: string,
    readonly titulo: string,
    readonly detalhe: string,
  ) {
    super(detalhe || titulo);
  }
}

export async function http<T>(url: string, init: RequestInit = {}): Promise<T> {
  if (!config) throw new Error('API não configurada: chame configurarApi() na subida.');
  const token = await config.obterToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${config.baseUrl}${url}`, { ...init, headers });
  const texto = await res.text();
  const corpo: unknown = texto ? JSON.parse(texto) : undefined;
  if (res.status === 401) config.aoNaoAutorizado();
  if (!res.ok) {
    const p = (corpo ?? {}) as Partial<Record<'type' | 'title' | 'detail', string>>;
    throw new ErroApi(res.status, p.type ?? 'about:blank', p.title ?? '', p.detail ?? '');
  }
  return { data: corpo, status: res.status, headers: res.headers } as T;
}
