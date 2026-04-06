import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { requireLibraryAdmin } from '@/lib/admin-library-auth';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: Request) {
  const denied = requireLibraryAdmin(request);
  if (denied) return denied;

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ ok: false, error: 'Use multipart/form-data.' }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Corpo inválido.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Arquivo ausente.' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'Imagem limitada a 5 MB.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: 'Formatos aceitos: JPEG, PNG, WebP ou GIF.' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg';
  const path = `previews/${randomUUID()}.${ext}`;

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.storage.from('library-previews').upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('[api/admin/library/upload]', error);
      return NextResponse.json(
        {
          ok: false,
          error:
            error.message.includes('Bucket not found') || error.message.includes('not found')
              ? 'Bucket library-previews não existe. Rode a migration SQL no Supabase (storage).'
              : error.message,
        },
        { status: 502 }
      );
    }

    const { data: pub } = supabase.storage.from('library-previews').getPublicUrl(path);
    return NextResponse.json({ ok: true, url: pub.publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha no upload.';
    console.error('[api/admin/library/upload]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
