import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';
import { requireAdminApi } from '@/lib/auth/require-admin-api';

export const runtime = 'nodejs';

const ALLOWED = new Set(['pending', 'confirmed', 'completed', 'cancelled']);
const TIMEZONE = 'America/Sao_Paulo';
const SESSION_DURATION_MIN = 60;

type Ctx = { params: Promise<{ id: string }> };

type SessionRow = {
  id: string;
  status: string;
  guest_name: string | null;
  guest_email: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  mentorship_model: string | null;
  context: string | null;
};

function addMinutesToHHMM(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor((total % (24 * 60)) / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

async function createCalendarEvent(row: SessionRow): Promise<{ ok: true; htmlLink?: string | null } | { ok: false; error: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    return { ok: false, error: 'Google OAuth não configurado no servidor.' };
  }
  if (!row.guest_email || !row.preferred_date || !row.preferred_time) {
    return { ok: false, error: 'Dados incompletos do pedido (email/data/hora).' };
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2 });

  const startTime = row.preferred_time.length === 5 ? `${row.preferred_time}:00` : row.preferred_time;
  const endHHMM = addMinutesToHHMM(row.preferred_time.slice(0, 5), SESSION_DURATION_MIN);
  const endTime = `${endHHMM}:00`;

  const summary = `Sessão de Mentoria — ${row.guest_name ?? row.guest_email}`;
  const description = [
    `Sessão com ${row.guest_name ?? '(sem nome)'} <${row.guest_email}>`,
    row.mentorship_model ? `Modalidade: ${row.mentorship_model}` : null,
    row.context ? `Contexto: ${row.context}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: 'all',
      requestBody: {
        summary,
        description,
        start: { dateTime: `${row.preferred_date}T${startTime}`, timeZone: TIMEZONE },
        end: { dateTime: `${row.preferred_date}T${endTime}`, timeZone: TIMEZONE },
        attendees: [{ email: row.guest_email }],
      },
    });
    return { ok: true, htmlLink: res.data.htmlLink ?? null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao criar evento no Google Calendar.';
    return { ok: false, error: msg };
  }
}

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
      .select('id, status, guest_name, guest_email, preferred_date, preferred_time, mentorship_model, context')
      .maybeSingle<SessionRow>();

    if (error) {
      console.error('[api/admin/diagnostic-sessions/[id]]', error);
      return NextResponse.json({ ok: false, error: 'Não foi possível atualizar.' }, { status: 502 });
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: 'Pedido não encontrado.' }, { status: 404 });
    }

    let calendarWarning: string | null = null;
    let calendarEventUrl: string | null = null;
    if (status === 'confirmed') {
      const result = await createCalendarEvent(data);
      if (result.ok) {
        calendarEventUrl = result.htmlLink ?? null;
      } else {
        console.error('[api/admin/diagnostic-sessions/[id]] calendar:', result.error);
        calendarWarning = result.error;
      }
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      status: data.status,
      calendarEventUrl,
      calendarWarning,
    });
  } catch (e) {
    console.error('[api/admin/diagnostic-sessions/[id]]', e);
    return NextResponse.json({ ok: false, error: 'Erro ao atualizar.' }, { status: 502 });
  }
}
