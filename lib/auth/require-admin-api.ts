import { NextResponse } from 'next/server';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';

export type AdminGateOk = { ok: true; userId: string };
export type AdminGateFail = { ok: false; response: NextResponse };
export type AdminGate = AdminGateOk | AdminGateFail;

/** Valida sessão e papel admin antes de rotas /api/admin/*. */
export async function requireAdminApi(): Promise<AdminGate> {
  const supabase = await createSupabaseCookieClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Não autenticado.' }, { status: 401 }),
    };
  }

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (pErr || profile?.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Acesso negado.' }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id };
}
