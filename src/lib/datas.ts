/** Datas civis em America/Sao_Paulo (P4), iguais às da API. */
const formatoIso = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const PRAZO_DIAS = 14;

export function hojeEmSaoPaulo(agora: Date = new Date()): string {
  return formatoIso.format(agora);
}

export function somarDias(data: string, dias: number): string {
  const [a, m, d] = data.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** AAAA-MM-DD → DD/MM/AAAA (layout: datas em DD/MM/AAAA). */
export function formatarData(data: string): string {
  const [a, m, d] = data.split('-');
  return `${d}/${m}/${a}`;
}
