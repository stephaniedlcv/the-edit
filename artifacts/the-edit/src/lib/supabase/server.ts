import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

export function isSupabaseServerConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY),
  );
}

export function getSupabaseServerClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseKey = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serverClient;
}
