import { NextResponse } from 'next/server';
import { requireLibraryAdmin } from '@/lib/admin-library-auth';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import type { LibraryContentType, LibraryItemInsert, LibraryStatus } from '@/lib/library-types';

export const runtime = 'nodejs';

const TYPES: LibraryContentType[] = ['video', 'ebook', 'article', 'tool', 'guide'];
const STATUSES: LibraryStatus[] = ['published', 'draft'];

function parseInsert(body: unknown): LibraryItemInsert | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const type = o.type;
  if (!title || typeof type !== 'string' || !TYPES.includes(type as LibraryContentType)) {
    return null;
  }
  const description = typeof o.description === 'string' ? o.description : '';
  const intro =
    o.intro === null || o.intro === undefined
      ? ''
      : typeof o.intro === 'string'
        ? o.intro.trim()
        : '';
  const preview_image_url =
    o.preview_image_url === null || o.preview_image_url === undefined
      ? null
      : typeof o.preview_image_url === 'string'
        ? o.preview_image_url.trim() || null
        : null;
  const duration =
    o.duration === null || o.duration === undefined
      ? null
      : typeof o.duration === 'string'
        ? o.duration.trim() || null
        : null;
  const pages =
    o.pages === null || o.pages === undefined
      ? null
      : typeof o.pages === 'number' && Number.isFinite(o.pages)
        ? Math.max(0, Math.floor(o.pages))
        : null;
  const views =
    typeof o.views === 'number' && Number.isFinite(o.views) ? Math.max(0, Math.floor(o.views)) : 0;
  const video_url =
    o.video_url === null || o.video_url === undefined
      ? null
      : typeof o.video_url === 'string'
        ? o.video_url.trim() || null
        : null;
  const material_url =
    o.material_url === null || o.material_url === undefined
      ? null
      : typeof o.material_url === 'string'
        ? o.material_url.trim() || null
        : null;
  const status =
    typeof o.status === 'string' && STATUSES.includes(o.status as LibraryStatus)
      ? (o.status as LibraryStatus)
      : 'published';

  const is_free = typeof o.is_free === 'boolean' ? o.is_free : true;
  let price_cents: number | null = null;
  if ('price_cents' in o) {
    if (o.price_cents === null || o.price_cents === undefined) {
      price_cents = null;
    } else if (typeof o.price_cents === 'number' && Number.isFinite(o.price_cents)) {
      price_cents = Math.max(0, Math.floor(o.price_cents));
    } else {
      return null;
    }
  }
  if (is_free) {
    price_cents = null;
  } else if (!price_cents || price_cents <= 0) {
    return null;
  }

  return {
    title,
    type: type as LibraryContentType,
    description,
    intro,
    preview_image_url,
    duration,
    pages,
    views,
    video_url,
    material_url,
    is_free,
    price_cents,
    status,
  };
}

export async function GET(request: Request) {
  const denied = requireLibraryAdmin(request);
  if (denied) return denied;

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar conteúdos.';
    console.error('[api/admin/library GET]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const denied = requireLibraryAdmin(request);
  if (denied) return denied;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const insert = parseInsert(json);
  if (!insert) {
    return NextResponse.json(
      { ok: false, error: 'Payload inválido. Informe title, type e campos opcionais válidos.' },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('library_items').insert(insert).select('*').single();

    if (error) throw error;
    return NextResponse.json({ ok: true, item: data }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar conteúdo.';
    console.error('[api/admin/library POST]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
