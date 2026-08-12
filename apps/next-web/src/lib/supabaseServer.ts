import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase de servidor (Route Handlers / Server Components).
 *
 * Usa a SERVICE ROLE KEY (`SUPABASE_SERVICE_ROLE_KEY`) quando disponível
 * para consultar dados sem depender de RLS. Nunca exponha essa chave ao
 * browser — ela é lida apenas do lado do servidor.
 *
 * Se nenhuma chave estiver configurada, retorna `null` e os chamadores
 * caem no fallback mock.
 */

let cached: SupabaseClient | null = null;

/**
 * Obtém o cliente administrativo do Supabase.
 * Prioriza a SERVICE_ROLE_KEY (segredo de servidor) para ignorar RLS.
 * Se ausente, tenta usar a ANON_KEY como fallback (sujeito a RLS).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) return null;

  // A serviceRoleKey NUNCA deve ter o prefixo NEXT_PUBLIC_
  const keyToUse = serviceRoleKey || anonKey;
  if (!keyToUse) return null;

  if (!cached) {
    cached = createClient(url, keyToUse, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return cached;
}
