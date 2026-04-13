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
      .select('role, username, full_name')
      .eq('id', user.id)
      .maybeSingle();

    let role: 'admin' | 'user' | null = null;
    if (profile?.role === 'admin') role = 'admin';
    else if (profile?.role === 'user') role = 'user';

    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const metaName =
      typeof meta?.full_name === 'string'
        ? meta.full_name.trim()
        : typeof meta?.name === 'string'
          ? meta.name.trim()
          : '';
    const profileFullName =
      typeof profile?.full_name === 'string' ? profile.full_name.trim() : '';
    const profileUsername =
      typeof profile?.username === 'string' ? profile.username.trim() : '';
    const name = profileFullName || profileUsername || metaName || null;

    return NextResponse.json({
      user: { id: user.id, email: user.email ?? null, name },
      role,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao ler sessão.';
    console.error('[api/auth/me]', e);
    return NextResponse.json({ ok: false, error: msg, user: null, role: null }, { status: 502 });
  }
}
