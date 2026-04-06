import { createClient } from '@supabase/supabase-js';
import type { LibraryItem } from '@/lib/library-types';

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SupabaseBrowserClient = ReturnType<typeof createBrowserSupabaseClient>;

export async function fetchPublishedLibraryItems(): Promise<LibraryItem[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LibraryItem[];
}
