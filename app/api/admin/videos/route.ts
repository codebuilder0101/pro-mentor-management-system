import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

function parseVideoBody(body: unknown): {
  name: string;
  duration_seconds: number;
  filepath: string;
  price_cents: number;
} | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  const filepath = typeof o.filepath === 'string' ? o.filepath.trim() : '';
  const duration =
    typeof o.duration_seconds === 'number' && Number.isFinite(o.duration_seconds)
      ? Math.floor(o.duration_seconds)
      : null;
  let price_cents = 0;
  if (typeof o.price_cents === 'number' && Number.isFinite(o.price_cents)) {
    price_cents = Math.max(0, Math.floor(o.price_cents));
  }
  if (!name || !filepath || duration === null || duration < 0) return null;
  return { name, duration_seconds: duration, filepath, price_cents };
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, videos: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar vídeos.';
    console.error('[api/admin/videos GET]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }
  const parsed = parseVideoBody(json);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: 'Payload inválido: name, duration_seconds (≥0), filepath, price_cents (≥0).' },
      { status: 400 }
    );
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('videos').insert(parsed).select('*').single();
    if (error) throw error;
    return NextResponse.json({ ok: true, item: data }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar vídeo.';
    console.error('[api/admin/videos POST]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
