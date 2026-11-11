// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = path.resolve(__dirname, '..', '..', '..');
const script = path.join(raiz, 'scripts', 'check-api.mjs');

function rodarCheck(env: Record<string, string> = {}): { codigo: number; saida: string } {
  try {
    const saida = execFileSync(process.execPath, [script], {
      cwd: raiz,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      stdio: 'pipe',
    });
    return { codigo: 0, saida };
  } catch (e) {
    const erro = e as { status: number; stderr: string };
    return { codigo: erro.status, saida: erro.stderr };
  }
}

describe('cliente gerado da API (check:api)', () => {
  it('[002 CA-15] passa quando o cliente bate com o openapi.json publicado pela API', () => {
    const r = rodarCheck();
    expect(r.codigo).toBe(0);
    expect(r.saida).toMatch(/check:api ok/);
  }, 60_000);

  it('[002 CA-15] falha quando o openapi.json muda e o cliente não foi regenerado', () => {
    const pasta = mkdtempSync(path.join(tmpdir(), 'contrato-'));
    try {
      const doc = JSON.parse(readFileSync(path.join(raiz, 'openapi.json'), 'utf8'));
      // Contrato novo: um campo a mais na resposta de /v1/me.
      const schemas = doc.components.schemas;
      const me = Object.keys(schemas).find((k) => k.startsWith('MeDto'));
      expect(me).toBeDefined();
      schemas[me as string].properties.campoNovo = { type: 'string' };
      schemas[me as string].required.push('campoNovo');
      const divergente = path.join(pasta, 'openapi.json');
      writeFileSync(divergente, JSON.stringify(doc));
      // A cópia e o arquivo da API mudaram juntos; só o cliente ficou para trás.
      const r = rodarCheck({ ORVAL_ENTRADA: divergente, OPENAPI_DA_API: divergente });
      expect(r.codigo).toBe(1);
      expect(r.saida).toMatch(/diverge do openapi\.json/);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  }, 60_000);

  it('[002 CA-15] falha quando a cópia do front difere do openapi.json publicado pela API', () => {
    const pasta = mkdtempSync(path.join(tmpdir(), 'contrato-'));
    try {
      // A API publicou um contrato novo e o front não rodou `npm run sync:api`.
      const doc = JSON.parse(readFileSync(path.join(raiz, 'openapi.json'), 'utf8'));
      doc.info.version = '2';
      const daApi = path.join(pasta, 'openapi-da-api.json');
      writeFileSync(daApi, JSON.stringify(doc, null, 2));
      const r = rodarCheck({ OPENAPI_DA_API: daApi });
      expect(r.codigo).toBe(1);
      expect(r.saida).toMatch(/difere do publicado pela API/);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  }, 60_000);
});
