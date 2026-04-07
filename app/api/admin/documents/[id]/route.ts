import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

function parseDocumentPatch(body: unknown): {
  name: string;
  filepath: string;
  price_cents: number;
} | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  const filepath = typeof o.filepath === 'string' ? o.filepath.trim() : '';
  let price_cents = 0;
  if (typeof o.price_cents === 'number' && Number.isFinite(o.price_cents)) {
    price_cents = Math.max(0, Math.floor(o.price_cents));
  }
  if (!name || !filepath) return null;
  return { name, filepath, price_cents };
}

export async function PATCH(request: Request, ctx: Ctx) {
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
  const parsed = parseDocumentPatch(json);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: 'Dados inválidos: nome e caminho são obrigatórios.' },
      { status: 400 }
    );
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('documents')
      .update(parsed)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Documento não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar documento.';
    console.error('[api/admin/documents/[id] PATCH]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });
  }
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao excluir.';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
