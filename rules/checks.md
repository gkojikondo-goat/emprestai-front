# Checks

Comandos que provam que uma tarefa ou spec está de pé neste repositório.
Uma tarefa só termina com todos passando. O verificador-spec roda estes
comandos exatamente como estão escritos (o hook dele só libera o que está
entre crases aqui).

- `npm run build` — TypeScript strict (`tsc --noEmit`) e build do Vite
- `npm test` — testes de componente e de lógica (Vitest + jsdom)
- `npm run check:api` — o cliente gerado em `src/lib/api/` bate com o `openapi.json` versionado

## O que nunca é check

Nada que publique ou escreva fora do repositório: deploy na Vercel, chamadas à
API de produção, login com contas reais. Os testes não falam com o Supabase nem
com a API: usam dublês injetados.
