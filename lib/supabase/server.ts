import { createClient } from '@supabase/supabase-js';
import type { LibraryItem } from '@/lib/library-types';

/** Server-only: anon client for public reads (respects RLS). */
export function createServerAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPublishedLibraryItemById(id: string): Promise<LibraryItem | null> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as LibraryItem | null;
}
