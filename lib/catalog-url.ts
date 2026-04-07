import { createServerAnonClient } from '@/lib/supabase/server';

/**
 * URL para abrir o ficheiro do catálogo (vídeo/documento).
 * Se `filepath` já for http(s), devolve tal qual.
 * Caso contrário, usa Storage público; buckets configuráveis por env.
 */
export function catalogMaterialPublicUrl(kind: 'video' | 'document', filepath: string): string {
  const trimmed = filepath.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const supabase = createServerAnonClient();
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET?.trim() ||
    (kind === 'video'
      ? process.env.NEXT_PUBLIC_SUPABASE_CATALOG_VIDEO_BUCKET?.trim() || 'media-videos'
      : process.env.NEXT_PUBLIC_SUPABASE_CATALOG_DOCUMENT_BUCKET?.trim() || 'media-documents');

  const { data } = supabase.storage.from(bucket).getPublicUrl(trimmed);
  return data.publicUrl;
}
