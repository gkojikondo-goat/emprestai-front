import { describe, expect, it } from 'vitest';
import { loadEnv } from './env';

const completo = {
  VITE_API_URL: 'http://localhost:3000/',
  VITE_SUPABASE_URL: 'https://exemplo.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'chave-publica',
} as unknown as ImportMetaEnv;

describe('loadEnv', () => {
  it('[001 CA-10] sem VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY falha citando a variável', () => {
    expect(() => loadEnv({ ...completo, VITE_SUPABASE_URL: '' })).toThrow(/VITE_SUPABASE_URL/);
    expect(() => loadEnv({ ...completo, VITE_SUPABASE_ANON_KEY: '' })).toThrow(
      /VITE_SUPABASE_ANON_KEY/,
    );
  });

  it('com as variáveis, devolve a configuração sem barra no final', () => {
    expect(loadEnv(completo)).toEqual({
      apiUrl: 'http://localhost:3000',
      supabaseUrl: 'https://exemplo.supabase.co',
      supabaseAnonKey: 'chave-publica',
    });
  });
});
