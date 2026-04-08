import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/require-admin-api';

export const runtime = 'nodejs';

function parseDocumentBody(body: unknown): {
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

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, documents: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar documentos.';
    console.error('[api/admin/documents GET]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }
  const parsed = parseDocumentBody(json);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: 'Payload inválido: name e filepath obrigatórios.' },
      { status: 400 }
    );
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('documents').insert(parsed).select('*').single();
    if (error) throw error;
    return NextResponse.json({ ok: true, item: data }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar documento.';
    console.error('[api/admin/documents POST]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
