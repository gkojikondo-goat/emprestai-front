// `npm run check:api` (spec 002 CA-15): gera o cliente de novo a partir do
// openapi.json versionado, numa pasta temporária ao lado da real, e falha se
// for diferente do cliente commitado em src/lib/api/generated/.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const real = path.join(raiz, 'src/lib/api/generated/api.ts');
const pastaTmp = path.join(raiz, 'src/lib/api/.check-tmp');
const tmp = path.join(pastaTmp, 'api.ts');

mkdirSync(pastaTmp, { recursive: true });
try {
  execFileSync(process.execPath, [path.join(raiz, 'node_modules/orval/dist/bin/orval.mjs')], {
    cwd: raiz,
    env: { ...process.env, ORVAL_SAIDA: tmp },
    stdio: 'pipe',
  });
  const norm = (f) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  if (norm(tmp) !== norm(real)) {
    console.error(
      'O cliente em src/lib/api/generated/ diverge do openapi.json. Rode `npm run gen:api` e commite.',
    );
    process.exit(1);
  }
  console.log('check:api ok — cliente igual ao gerado do openapi.json');
} finally {
  rmSync(pastaTmp, { recursive: true, force: true });
}
