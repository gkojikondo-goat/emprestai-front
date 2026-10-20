export type Env = { apiUrl: string };

export function loadEnv(source: ImportMetaEnv = import.meta.env): Env {
  const raw = source.VITE_API_URL?.trim();
  if (!raw) {
    throw new Error(
      'Configuração inválida: a variável VITE_API_URL está ausente (veja .env.example).',
    );
  }
  try {
    new URL(raw);
  } catch {
    throw new Error(
      'Configuração inválida: VITE_API_URL deve ser uma URL, ex.: http://localhost:3000.',
    );
  }
  return { apiUrl: raw.replace(/\/+$/, '') };
}
