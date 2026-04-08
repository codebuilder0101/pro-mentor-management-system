import { NextResponse } from 'next/server';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createSupabaseCookieClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null, role: null });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role === 'admin' ? 'admin' : 'user';

    return NextResponse.json({
      user: { id: user.id, email: user.email ?? null },
      role,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao ler sessão.';
    console.error('[api/auth/me]', e);
    return NextResponse.json({ ok: false, error: msg, user: null, role: null }, { status: 502 });
  }
}
