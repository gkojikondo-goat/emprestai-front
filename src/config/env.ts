export type Env = {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function loadEnv(source: ImportMetaEnv = import.meta.env): Env {
  const apiUrl = source.VITE_API_URL?.trim();
  const supabaseUrl = source.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = source.VITE_SUPABASE_ANON_KEY?.trim();

  const problems: string[] = [];
  if (!apiUrl) {
    problems.push('VITE_API_URL: variável ausente.');
  } else if (!isUrl(apiUrl)) {
    problems.push('VITE_API_URL: deve ser uma URL, ex.: http://localhost:3000.');
  }
  if (!supabaseUrl) {
    problems.push('VITE_SUPABASE_URL: variável ausente.');
  } else if (!isUrl(supabaseUrl)) {
    problems.push(
      'VITE_SUPABASE_URL: deve ser uma URL, ex.: https://<projeto>.supabase.co.',
    );
  }
  if (!supabaseAnonKey) {
    problems.push('VITE_SUPABASE_ANON_KEY: variável ausente.');
  }

  if (problems.length > 0 || !apiUrl || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Configuração inválida (veja .env.example):\n${problems.map((p) => `- ${p}`).join('\n')}`,
    );
  }

  return {
    apiUrl: apiUrl.replace(/\/+$/, ''),
    supabaseUrl: supabaseUrl.replace(/\/+$/, ''),
    supabaseAnonKey,
  };
}
