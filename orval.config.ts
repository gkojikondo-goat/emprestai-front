import { defineConfig } from 'orval';

/**
 * Cliente da API gerado do openapi.json (ADR-001: nenhuma chamada escrita à mão).
 * O openapi.json é copiado da API com `npm run sync:api` e versionado aqui.
 */
export default defineConfig({
  api: {
    input: { target: process.env.ORVAL_ENTRADA ?? './openapi.json' },
    output: {
      target: process.env.ORVAL_SAIDA ?? './src/lib/api/generated/api.ts',
      client: 'fetch',
      mode: 'single',
      override: {
        mutator: { path: './src/lib/api/http.ts', name: 'http' },
      },
    },
  },
});
