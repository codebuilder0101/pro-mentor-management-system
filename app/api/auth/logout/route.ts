import { NextResponse } from 'next/server';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const supabase = await createSupabaseCookieClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao terminar sessão.';
    console.error('[api/auth/logout]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
