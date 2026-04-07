import { createClient } from '@supabase/supabase-js';
import type { ArtigoRow } from '@/lib/artigo-types';
import type { DocumentRow, VideoRow } from '@/lib/catalog-types';
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

export async function fetchCatalogVideos(): Promise<VideoRow[]> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as VideoRow[];
}

export async function fetchCatalogDocuments(): Promise<DocumentRow[]> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function getCatalogVideoById(id: string): Promise<VideoRow | null> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase.from('videos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as VideoRow | null;
}

export async function getCatalogDocumentById(id: string): Promise<DocumentRow | null> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase.from('documents').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as DocumentRow | null;
}

/** Depoimentos publicados (secção na página de mentoria). */
export async function fetchPublishedDepoimentos(): Promise<ArtigoRow[]> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .eq('publicado', true)
    .eq('tipo', 'depoimento')
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ArtigoRow[];
}
