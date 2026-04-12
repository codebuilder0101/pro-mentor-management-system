import { NextResponse } from 'next/server';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';
import { requireAdminApi } from '@/lib/auth/require-admin-api';

export const runtime = 'nodejs';

const ALLOWED = new Set(['pending', 'confirmed', 'completed', 'cancelled']);

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ ok: false, error: 'Identificador inválido.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const status =
    body && typeof body === 'object' && 'status' in body && typeof (body as { status: unknown }).status === 'string'
      ? (body as { status: string }).status.trim()
      : '';

  if (!ALLOWED.has(status)) {
    return NextResponse.json({ ok: false, error: 'Estado inválido.' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseCookieClient();
    const { data, error } = await supabase
      .from('diagnostic_session_requests')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .maybeSingle();

    if (error) {
      console.error('[api/admin/diagnostic-sessions/[id]]', error);
      return NextResponse.json({ ok: false, error: 'Não foi possível atualizar.' }, { status: 502 });
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: data.id, status: data.status });
  } catch (e) {
    console.error('[api/admin/diagnostic-sessions/[id]]', e);
    return NextResponse.json({ ok: false, error: 'Erro ao atualizar.' }, { status: 502 });
  }
}
