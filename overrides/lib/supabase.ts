import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Doit's browser key is a Supabase publishable key. It is intentionally public;
 * database access is constrained by the project's RLS policies.
 *
 * The fallback prevents a missing Vercel environment variable from disabling
 * registration/login and rendering the misleading "Configuración inicial" page.
 */
const DOIT_SUPABASE_URL = 'https://myxczqevsbeniwscdxhz.supabase.co';
const DOIT_PUBLISHABLE_KEY = 'sb_publishable_Zb1QFuLVEflu0inHQd7qDQ_CWtFo5JR';

let browserClient: SupabaseClient | null = null;

function getPublicConfiguration() {
  const candidateUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const candidateKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

  const urlIsValid = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(candidateUrl);
  const keyIsPublic =
    candidateKey.startsWith('sb_publishable_') ||
    (candidateKey.startsWith('eyJ') && candidateKey.split('.').length === 3);

  return {
    url: urlIsValid ? candidateUrl.replace(/\/$/, '') : DOIT_SUPABASE_URL,
    key: keyIsPublic ? candidateKey : DOIT_PUBLISHABLE_KEY,
  };
}

export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    const { url, key } = getPublicConfiguration();
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: { 'X-Client-Info': 'doit-web/1.1.0' },
      },
    });
  }
  return browserClient;
}
