import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Cliente com cookies da sessão (Route Handlers, Server Components, Server Actions). */
export async function createSupabaseCookieClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* setAll a partir de Server Component sem mutar cookies */
        }
      },
    },
  });
}
