import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/require-admin-api';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('books')
      .select('id, title, path, created_at, updated_at')
      .order('title', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ ok: true, books: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar livros.';
    console.error('[api/admin/books GET]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
