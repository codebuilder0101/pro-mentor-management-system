import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

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
