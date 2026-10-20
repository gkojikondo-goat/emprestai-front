import type { Credentials } from './LoginPage';
import type { Supabase } from '../../lib/supabase';

const INVALID_CREDENTIALS = 'E-mail ou senha incorretos.';
const UNAVAILABLE = 'Não foi possível entrar agora. Tente novamente.';

/** Devolve a mensagem de erro para a tela, ou undefined quando o login deu certo. */
export async function signIn(
  supabase: Supabase,
  { email, password }: Credentials,
): Promise<string | undefined> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return undefined;
    return error.code === 'invalid_credentials' ? INVALID_CREDENTIALS : UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
}
