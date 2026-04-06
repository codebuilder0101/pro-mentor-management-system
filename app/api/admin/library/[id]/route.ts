import { NextResponse } from 'next/server';
import { requireLibraryAdmin } from '@/lib/admin-library-auth';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import type { LibraryContentType, LibraryItemUpdate, LibraryStatus } from '@/lib/library-types';

export const runtime = 'nodejs';

const TYPES: LibraryContentType[] = ['video', 'ebook', 'article', 'tool', 'guide'];
const STATUSES: LibraryStatus[] = ['published', 'draft'];

function parsePatch(body: unknown): LibraryItemUpdate | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const patch: LibraryItemUpdate = {};

  if ('title' in o) {
    if (typeof o.title !== 'string' || !o.title.trim()) return null;
    patch.title = o.title.trim();
  }
  if ('type' in o) {
    if (typeof o.type !== 'string' || !TYPES.includes(o.type as LibraryContentType)) return null;
    patch.type = o.type as LibraryContentType;
  }
  if ('description' in o && typeof o.description === 'string') {
    patch.description = o.description;
  }
  if ('intro' in o) {
    patch.intro =
      o.intro === null
        ? ''
        : typeof o.intro === 'string'
          ? o.intro.trim()
          : '';
  }
  if ('preview_image_url' in o) {
    patch.preview_image_url =
      o.preview_image_url === null
        ? null
        : typeof o.preview_image_url === 'string'
          ? o.preview_image_url.trim() || null
          : null;
  }
  if ('duration' in o) {
    patch.duration =
      o.duration === null
        ? null
        : typeof o.duration === 'string'
          ? o.duration.trim() || null
          : null;
  }
  if ('pages' in o) {
    patch.pages =
      o.pages === null
        ? null
        : typeof o.pages === 'number' && Number.isFinite(o.pages)
          ? Math.max(0, Math.floor(o.pages))
          : null;
  }
  if ('views' in o) {
    if (typeof o.views !== 'number' || !Number.isFinite(o.views)) return null;
    patch.views = Math.max(0, Math.floor(o.views));
  }
  if ('video_url' in o) {
    patch.video_url =
      o.video_url === null
        ? null
        : typeof o.video_url === 'string'
          ? o.video_url.trim() || null
          : null;
  }
  if ('material_url' in o) {
    patch.material_url =
      o.material_url === null
        ? null
        : typeof o.material_url === 'string'
          ? o.material_url.trim() || null
          : null;
  }
  if ('status' in o) {
    if (typeof o.status !== 'string' || !STATUSES.includes(o.status as LibraryStatus)) return null;
    patch.status = o.status as LibraryStatus;
  }
  if ('is_free' in o) {
    if (typeof o.is_free !== 'boolean') return null;
    patch.is_free = o.is_free;
    if (o.is_free) {
      patch.price_cents = null;
    }
  }
  if ('price_cents' in o && patch.is_free !== true) {
    if (o.price_cents === null || o.price_cents === undefined) {
      patch.price_cents = null;
    } else if (typeof o.price_cents === 'number' && Number.isFinite(o.price_cents)) {
      patch.price_cents = Math.max(0, Math.floor(o.price_cents));
    } else {
      return null;
    }
  }

  return Object.keys(patch).length ? patch : {};
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const denied = requireLibraryAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('library_items').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao buscar conteúdo.';
    console.error('[api/admin/library/[id] GET]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = requireLibraryAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const patch = parsePatch(json);
  if (patch === null) {
    return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nenhum campo para atualizar.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('library_items')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar conteúdo.';
    console.error('[api/admin/library/[id] PATCH]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const denied = requireLibraryAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('library_items').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao excluir conteúdo.';
    console.error('[api/admin/library/[id] DELETE]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
