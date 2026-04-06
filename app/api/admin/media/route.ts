import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import {
  PREVIEW_MAX_BYTES,
  PREVIEW_MIME,
  VIDEO_MAX_BYTES,
  VIDEO_MIME,
  previewExtensionFromMime,
  videoExtensionFromMime,
} from '@/lib/media-constants';
import type { MediaItemType } from '@/lib/media-constants';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

function parseDurationSeconds(minStr: string | null, secStr: string | null): number | null {
  const m = minStr?.trim() ? parseInt(minStr.trim(), 10) : 0;
  const s = secStr?.trim() ? parseInt(secStr.trim(), 10) : 0;
  if (Number.isNaN(m) || Number.isNaN(s) || m < 0 || s < 0) return null;
  return m * 60 + s;
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('media_items')
      .select(
        `
        id,
        book_id,
        type,
        name,
        storage_path,
        preview_image_path,
        file_path,
        duration_seconds,
        status,
        views,
        created_by,
        created_at,
        updated_at,
        books ( title, path )
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar mídias.';
    console.error('[api/admin/media GET]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ ok: false, error: 'Use multipart/form-data.' }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Corpo inválido.' }, { status: 400 });
  }

  const bookMode = form.get('bookMode');
  const bookIdRaw = form.get('bookId');
  const newBookTitle = typeof form.get('newBookTitle') === 'string' ? form.get('newBookTitle') : '';
  const newBookPath = typeof form.get('newBookPath') === 'string' ? form.get('newBookPath') : '';
  const mediaTypeRaw = form.get('mediaType');
  const name = typeof form.get('name') === 'string' ? (form.get('name') as string).trim() : '';
  const storagePath =
    typeof form.get('storagePath') === 'string' ? (form.get('storagePath') as string).trim() : '';
  const durationMinutes = typeof form.get('durationMinutes') === 'string' ? form.get('durationMinutes') : '';
  const durationSeconds = typeof form.get('durationSeconds') === 'string' ? form.get('durationSeconds') : '';
  const statusRaw = form.get('status');

  const mediaType: MediaItemType | null =
    mediaTypeRaw === 'video' || mediaTypeRaw === 'book' ? mediaTypeRaw : null;
  const status =
    statusRaw === 'published' || statusRaw === 'draft' ? statusRaw : 'draft';

  const preview = form.get('preview');
  const video = form.get('video');

  if (!mediaType) {
    return NextResponse.json({ ok: false, error: 'Tipo de mídia inválido.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: 'Nome do vídeo/conteúdo é obrigatório.' }, { status: 400 });
  }
  if (!storagePath) {
    return NextResponse.json(
      { ok: false, error: 'Caminho no armazenamento (storage path) é obrigatório.' },
      { status: 400 }
    );
  }

  if (!(preview instanceof File) || preview.size === 0) {
    return NextResponse.json(
      { ok: false, error: 'Imagem de pré-visualização é obrigatória.' },
      { status: 400 }
    );
  }
  if (preview.size > PREVIEW_MAX_BYTES || !PREVIEW_MIME.has(preview.type)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Pré-visualização: use JPEG, PNG, WebP ou GIF até 5 MB.',
      },
      { status: 400 }
    );
  }

  let durationTotal: number | null = null;
  if (mediaType === 'video') {
    durationTotal = parseDurationSeconds(
      durationMinutes as string,
      durationSeconds as string
    );
    if (durationTotal === null || durationTotal <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Para vídeo, informe duração válida (minutos e segundos ≥ 0, total > 0).',
        },
        { status: 400 }
      );
    }
  }

  if (mediaType === 'video') {
    if (!(video instanceof File) || video.size === 0) {
      return NextResponse.json(
        { ok: false, error: 'Arquivo de vídeo é obrigatório para tipo vídeo.' },
        { status: 400 }
      );
    }
    if (video.size > VIDEO_MAX_BYTES || !VIDEO_MIME.has(video.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Vídeo: use MP4, MOV ou WebM até 500 MB.',
        },
        { status: 400 }
      );
    }
  } else if (mediaType === 'book' && video instanceof File && video.size > 0) {
    return NextResponse.json(
      { ok: false, error: 'Tipo livro não inclui arquivo de vídeo.' },
      { status: 400 }
    );
  }

  let resolvedBookId: string | null = null;

  if (bookMode === 'new') {
    const title = typeof newBookTitle === 'string' ? newBookTitle.trim() : '';
    const path = typeof newBookPath === 'string' ? newBookPath.trim() : '';
    if (!title || !path) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Para novo livro, título e caminho (path) são obrigatórios.',
        },
        { status: 400 }
      );
    }
    try {
      const supabase = createServiceRoleClient();
      const { data: bookRow, error: bookErr } = await supabase
        .from('books')
        .insert({ title, path })
        .select('id')
        .single();
      if (bookErr) throw bookErr;
      resolvedBookId = bookRow.id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar livro.';
      console.error('[api/admin/media POST book]', e);
      return NextResponse.json({ ok: false, error: msg }, { status: 502 });
    }
  } else if (bookMode === 'existing') {
    const bid =
      typeof bookIdRaw === 'string' && bookIdRaw.trim() ? bookIdRaw.trim() : '';
    if (!bid) {
      return NextResponse.json(
        { ok: false, error: 'Selecione um livro existente.' },
        { status: 400 }
      );
    }
    try {
      const supabase = createServiceRoleClient();
      const { data: exists, error: exErr } = await supabase
        .from('books')
        .select('id')
        .eq('id', bid)
        .maybeSingle();
      if (exErr) throw exErr;
      if (!exists) {
        return NextResponse.json({ ok: false, error: 'Livro não encontrado.' }, { status: 400 });
      }
      resolvedBookId = bid;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao validar livro.';
      return NextResponse.json({ ok: false, error: msg }, { status: 502 });
    }
  } else {
    return NextResponse.json(
      { ok: false, error: 'Modo de livro inválido (existing ou new).' },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const previewBuf = Buffer.from(await preview.arrayBuffer());
  const previewPath = `previews/${randomUUID()}.${previewExtensionFromMime(preview.type)}`;
  const { error: upPrev } = await supabase.storage.from('media-previews').upload(previewPath, previewBuf, {
    contentType: preview.type,
    upsert: false,
  });
  if (upPrev) {
    console.error('[media upload preview]', upPrev);
    return NextResponse.json(
      {
        ok: false,
        error: upPrev.message.includes('Bucket not found')
          ? 'Bucket media-previews não existe. Rode a migration SQL no Supabase.'
          : upPrev.message,
      },
      { status: 502 }
    );
  }

  let videoPath: string | null = null;
  if (mediaType === 'video' && video instanceof File) {
    const videoBuf = Buffer.from(await video.arrayBuffer());
    videoPath = `videos/${randomUUID()}.${videoExtensionFromMime(video.type)}`;
    const { error: upVid } = await supabase.storage.from('media-videos').upload(videoPath, videoBuf, {
      contentType: video.type,
      upsert: false,
    });
    if (upVid) {
      await supabase.storage.from('media-previews').remove([previewPath]);
      console.error('[media upload video]', upVid);
      return NextResponse.json(
        {
          ok: false,
          error: upVid.message.includes('Bucket not found')
            ? 'Bucket media-videos não existe. Rode a migration SQL no Supabase.'
            : upVid.message,
        },
        { status: 502 }
      );
    }
  }

  const { data: inserted, error: insErr } = await supabase
    .from('media_items')
    .insert({
      book_id: resolvedBookId!,
      type: mediaType,
      name,
      storage_path: storagePath,
      preview_image_path: previewPath,
      file_path: videoPath,
      duration_seconds: durationTotal,
      status,
    })
    .select('*')
    .single();

  if (insErr) {
    await supabase.storage.from('media-previews').remove([previewPath]);
    if (videoPath) await supabase.storage.from('media-videos').remove([videoPath]);
    console.error('[media insert]', insErr);
    return NextResponse.json({ ok: false, error: insErr.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, item: inserted }, { status: 201 });
}
