import { NextResponse } from 'next/server';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';
import { validateSchedulePayload } from '@/lib/schedule-validation';
import type { ScheduleErrorResponse, ScheduleSuccessResponse } from '@/lib/schedule-types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    const body: ScheduleErrorResponse = {
      ok: false,
      error: 'JSON inválido.',
      code: 'INVALID_JSON',
    };
    return NextResponse.json(body, { status: 400 });
  }

  const validated = validateSchedulePayload(json);
  if (!validated.ok) {
    const body: ScheduleErrorResponse = {
      ok: false,
      error: 'Dados inválidos.',
      code: 'VALIDATION_ERROR',
      details: validated.errors,
    };
    return NextResponse.json(body, { status: 400 });
  }

  const supabase = await createSupabaseCookieClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    const body: ScheduleErrorResponse = {
      ok: false,
      error: 'É necessário iniciar sessão para agendar.',
      code: 'UNAUTHORIZED',
    };
    return NextResponse.json(body, { status: 401 });
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr || profile?.role !== 'user') {
    const body: ScheduleErrorResponse = {
      ok: false,
      error: 'Apenas participantes com perfil de utilizador podem pedir esta sessão.',
      code: 'FORBIDDEN',
    };
    return NextResponse.json(body, { status: 403 });
  }

  const sessionEmail = (user.email ?? '').trim().toLowerCase();
  const formEmail = validated.data.email.trim().toLowerCase();
  if (!sessionEmail || formEmail !== sessionEmail) {
    const body: ScheduleErrorResponse = {
      ok: false,
      error: 'O email do formulário deve ser o mesmo da sua conta.',
      code: 'EMAIL_MISMATCH',
    };
    return NextResponse.json(body, { status: 400 });
  }

  const row = {
    user_id: user.id,
    guest_name: validated.data.name.trim(),
    guest_email: validated.data.email.trim(),
    phone: validated.data.phone.trim(),
    preferred_date: validated.data.preferredDate,
    preferred_time: validated.data.preferredTime,
    mentorship_model: validated.data.mentorshipModel,
    context: validated.data.context?.trim() || null,
    status: 'pending' as const,
  };

  try {
    const { data: inserted, error: insertErr } = await supabase
      .from('diagnostic_session_requests')
      .insert(row)
      .select('id')
      .single();

    if (insertErr || !inserted?.id) {
      console.error('[api/schedule] insert', insertErr);
      const body: ScheduleErrorResponse = {
        ok: false,
        error: 'Não foi possível guardar o pedido. Tente novamente ou entre em contato.',
        code: 'DATABASE_ERROR',
      };
      return NextResponse.json(body, { status: 502 });
    }

    const body: ScheduleSuccessResponse = {
      ok: true,
      id: inserted.id as string,
    };
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    console.error('[api/schedule]', err);
    const body: ScheduleErrorResponse = {
      ok: false,
      error: 'Erro inesperado ao guardar o pedido.',
      code: 'SERVER_ERROR',
    };
    return NextResponse.json(body, { status: 502 });
  }
}
