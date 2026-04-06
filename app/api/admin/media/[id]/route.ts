import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type RouteCtx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: row, error: fetchErr } = await supabase
      .from('media_items')
      .select('preview_image_path, file_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!row) {
      return NextResponse.json({ ok: false, error: 'Item não encontrado.' }, { status: 404 });
    }

    const pathsPreview = row.preview_image_path ? [row.preview_image_path] : [];
    const pathsVideo = row.file_path ? [row.file_path] : [];

    if (pathsPreview.length) {
      await supabase.storage.from('media-previews').remove(pathsPreview);
    }
    if (pathsVideo.length) {
      await supabase.storage.from('media-videos').remove(pathsVideo);
    }

    const { error: delErr } = await supabase.from('media_items').delete().eq('id', id);
    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao excluir.';
    console.error('[api/admin/media DELETE]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
