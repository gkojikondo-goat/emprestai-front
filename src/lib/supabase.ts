import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../config/env';

export type Supabase = SupabaseClient;

export function createSupabase(env: Env): Supabase {
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
