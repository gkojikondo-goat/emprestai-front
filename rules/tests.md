# Testes

## Todo CA [front] tem teste que o cita

- O título do teste começa com o número da spec e o ID do CA entre
  colchetes: `it('[006 CA-16] com 3 em aberto mostra "Limite de 3 itens"', ...)`.
  O número da spec é obrigatório porque todas as specs têm um CA-01.
- Um teste pode citar mais de um CA: `[003 CA-03][003 CA-04]`.
- CA sem teste com essa marca é SEM TESTE para o verificador-spec.

## Onde fica cada tipo

| Tipo | Ferramenta | Onde |
|---|---|---|
| Lógica pura (datas, rótulos, mapeamentos) | Vitest | `src/**/*.test.ts`, ao lado do arquivo |
| Componente e tela | Vitest + Testing Library (jsdom) | `src/**/*.test.tsx`, ao lado do arquivo |

## Dublês, nunca serviços reais

- Supabase e API entram por injeção (props/contexto). Os testes passam dublês
  com respostas fixas; nenhum teste faz requisição de rede.
- CA que só pode ser provado no navegador real ou na Vercel (ex.: rewrite de
  SPA) é provado por teste do arquivo de configuração (ex.: `vercel.json`) e
  marcado na spec como "conferido no link de produção".
