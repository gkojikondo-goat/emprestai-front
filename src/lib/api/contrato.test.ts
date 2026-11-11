// @vitest-environment node
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = path.resolve(__dirname, '..', '..', '..');

describe('cliente gerado da API', () => {
  it('[002 CA-15] o cliente em src/lib/api/generated bate com o openapi.json (npm run check:api)', () => {
    const saida = execFileSync(process.execPath, [path.join(raiz, 'scripts', 'check-api.mjs')], {
      cwd: raiz,
      encoding: 'utf8',
    });
    expect(saida).toMatch(/check:api ok/);
  }, 60_000);
});
