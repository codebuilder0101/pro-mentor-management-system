import { NextResponse } from 'next/server';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';
import { requireAdminApi } from '@/lib/auth/require-admin-api';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const supabase = await createSupabaseCookieClient();
    const { data, error } = await supabase
      .from('diagnostic_session_requests')
      .select(
        'id, guest_name, guest_email, phone, preferred_date, preferred_time, mentorship_model, context, status, created_at, user_id'
      )
      .order('preferred_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[api/admin/diagnostic-sessions]', error);
      return NextResponse.json({ ok: false, error: 'Não foi possível carregar as sessões.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, sessions: data ?? [] });
  } catch (e) {
    console.error('[api/admin/diagnostic-sessions]', e);
    return NextResponse.json({ ok: false, error: 'Erro ao carregar sessões.' }, { status: 502 });
  }
}
