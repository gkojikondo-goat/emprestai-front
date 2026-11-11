// `npm run check:api` (spec 002 CA-15). Duas conferências:
//  1. o openapi.json do front é o mesmo publicado pela API (o versionado no
//     repositório emprestai-api, quando ele está ao lado deste);
//  2. o cliente commitado em src/lib/api/generated/ é exatamente o que o orval
//     gera a partir desse openapi.json.
// Falha (exit 1) em qualquer divergência. ORVAL_ENTRADA troca o openapi.json
// de entrada e OPENAPI_DA_API troca o arquivo da API (usados nos testes dos
// caminhos de falha).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const entrada = path.resolve(raiz, process.env.ORVAL_ENTRADA ?? 'openapi.json');
const daApi = path.resolve(
  raiz,
  process.env.OPENAPI_DA_API ?? path.join('..', 'emprestai-api', 'openapi.json'),
);
const real = path.join(raiz, 'src/lib/api/generated/api.ts');
const pastaTmp = path.join(raiz, 'src/lib/api/.check-tmp');
const tmp = path.join(pastaTmp, 'api.ts');
const norm = (f) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');

function falhar(msg) {
  console.error(msg);
  process.exit(1);
}

if (existsSync(daApi) && norm(daApi) !== norm(entrada)) {
  falhar('openapi.json do front difere do publicado pela API. Rode `npm run sync:api` e `npm run gen:api`.');
}

mkdirSync(pastaTmp, { recursive: true });
try {
  execFileSync(process.execPath, [path.join(raiz, 'node_modules/orval/dist/bin/orval.mjs')], {
    cwd: raiz,
    env: { ...process.env, ORVAL_SAIDA: tmp, ORVAL_ENTRADA: entrada },
    stdio: 'pipe',
  });
  if (norm(tmp) !== norm(real)) {
    falhar('O cliente em src/lib/api/generated/ diverge do openapi.json. Rode `npm run gen:api` e commite.');
  }
  console.log('check:api ok — cliente igual ao gerado do openapi.json');
} finally {
  rmSync(pastaTmp, { recursive: true, force: true });
}
