import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/require-admin-api';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

function parseVideoPatch(body: unknown): {
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

export async function PATCH(request: Request, ctx: Ctx) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }
  const parsed = parseVideoPatch(json);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: 'Dados inválidos: nome, duração (≥0), caminho e preço (centavos ≥0).' },
      { status: 400 }
    );
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('videos')
      .update(parsed)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Vídeo não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar vídeo.';
    console.error('[api/admin/videos/[id] PATCH]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });
  }
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao excluir.';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
