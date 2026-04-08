import { createServiceRoleClient } from '@/lib/supabase/admin';

function catalogBucket(kind: 'video' | 'document'): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET?.trim() ||
    (kind === 'video'
      ? process.env.NEXT_PUBLIC_SUPABASE_CATALOG_VIDEO_BUCKET?.trim() || 'media-videos'
      : process.env.NEXT_PUBLIC_SUPABASE_CATALOG_DOCUMENT_BUCKET?.trim() || 'media-documents')
  );
}

/**
 * URL para o ficheiro do catálogo após verificação de direito de acesso.
 * URLs http(s) externas devolvem-se tal qual; paths no Storage usam URL assinada (service role).
 */
export async function createCatalogMaterialSignedUrl(
  kind: 'video' | 'document',
  filepath: string,
  expiresSec = 3600
): Promise<string> {
  const trimmed = filepath.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const supabase = createServiceRoleClient();
  const bucket = catalogBucket(kind);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(trimmed, expiresSec);
  if (error) {
    throw new Error(error.message || 'Não foi possível gerar URL do ficheiro.');
  }
  if (!data?.signedUrl) {
    throw new Error('Resposta vazia ao gerar URL assinada.');
  }
  return data.signedUrl;
}
