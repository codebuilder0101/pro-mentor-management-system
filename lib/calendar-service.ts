import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import type { OAuth2Client } from 'google-auth-library';
import { google, calendar_v3 } from 'googleapis';
import type { ValidatedSchedule } from '@/lib/schedule-validation';

function formatGoogleCalendarError(err: unknown): string {
  const e = err as {
    response?: { status?: number; data?: { error?: { message?: string } } };
    message?: string;
  };
  const status = e.response?.status;
  const apiMsg = e.response?.data?.error?.message;
  if (status === 401 || (apiMsg && /invalid_grant|Invalid Credentials/i.test(apiMsg))) {
    return 'Credenciais Google inválidas ou expiradas. Acesse /api/google/auth, autorize de novo e atualize GOOGLE_REFRESH_TOKEN no servidor.';
  }
  if (apiMsg) return apiMsg;
  return err instanceof Error ? err.message : 'Erro ao criar evento no Google Calendar.';
}

async function getCalendarOwnerEmail(auth: OAuth2Client): Promise<string | null> {
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const { data } = await oauth2.userinfo.get();
    return data.email?.trim().toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    throw new Error(
      'Configuração incompleta: defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI e GOOGLE_REFRESH_TOKEN.'
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

function eventTimeBounds(preferredDate: string, preferredTime: string, timeZone: string) {
  const wall = `${preferredDate}T${preferredTime}:00`;
  const startInstant = toDate(wall, { timeZone });
  if (Number.isNaN(startInstant.getTime())) {
    throw new Error('Data/horário inválidos para o fuso configurado.');
  }
  const endInstant = addMinutes(startInstant, 45);
  return {
    startDateTime: formatInTimeZone(startInstant, timeZone, "yyyy-MM-dd'T'HH:mm:ss"),
    endDateTime: formatInTimeZone(endInstant, timeZone, "yyyy-MM-dd'T'HH:mm:ss"),
  };
}

function mentorshipModelLabel(model: ValidatedSchedule['mentorshipModel']): string {
  return model === 'presencial' ? 'Presencial' : 'Online';
}

function buildDescription(data: ValidatedSchedule): string {
  const lines = [
    `Nome: ${data.name}`,
    `Email: ${data.email}`,
    `Telefone: ${data.phone}`,
    `Modelo da mentoria: ${mentorshipModelLabel(data.mentorshipModel)}`,
    data.context ? `Contexto:\n${data.context}` : 'Contexto: (não informado)',
  ];
  return lines.join('\n\n');
}

export type CreateEventResult = {
  eventId: string;
  htmlLink: string;
  meetLink: string | null;
  sameAccountAsGuest: boolean;
};

export async function createDiagnosticSessionEvent(data: ValidatedSchedule): Promise<CreateEventResult> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary';
  const timeZone = process.env.SCHEDULE_TIMEZONE?.trim() || 'America/Sao_Paulo';
  const meetEnabled = process.env.ENABLE_GOOGLE_MEET === 'true' || process.env.ENABLE_GOOGLE_MEET === '1';

  const auth = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const organizerEmail = await getCalendarOwnerEmail(auth);
  const sameAccountAsGuest =
    organizerEmail !== null && organizerEmail === data.email.trim().toLowerCase();

  const { startDateTime, endDateTime } = eventTimeBounds(data.preferredDate, data.preferredTime, timeZone);

  const modelShort = mentorshipModelLabel(data.mentorshipModel);
  const requestBody: calendar_v3.Schema$Event = {
    summary: `Sessão de diagnóstico — ${data.name} (${modelShort})`.slice(0, 1024),
    description: buildDescription(data),
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
    attendees: [{ email: data.email }],
    reminders: { useDefault: true },
  };

  if (meetEnabled) {
    requestBody.conferenceData = {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  let event: calendar_v3.Schema$Event;
  try {
    const res = await calendar.events.insert({
      calendarId,
      requestBody,
      conferenceDataVersion: meetEnabled ? 1 : 0,
      sendUpdates: 'all',
    });
    event = res.data;
  } catch (err) {
    throw new Error(formatGoogleCalendarError(err));
  }

  if (!event.id || !event.htmlLink) {
    throw new Error('Resposta inesperada da API do Google Calendar (sem id ou link).');
  }

  let verified: calendar_v3.Schema$Event;
  try {
    const got = await calendar.events.get({ calendarId, eventId: event.id });
    verified = got.data;
  } catch (err) {
    throw new Error(
      `Evento criado (id ${event.id}) mas não foi possível confirmar no calendário: ${formatGoogleCalendarError(err)}`
    );
  }

  const attendeeEmails = (verified.attendees ?? [])
    .map((a) => (a.email ?? '').trim().toLowerCase())
    .filter(Boolean);
  const guestListed = attendeeEmails.includes(data.email.trim().toLowerCase());
  if (!guestListed) {
    throw new Error(
      'O evento foi criado, mas o email do convidado não aparece nos participantes. Verifique GOOGLE_CALENDAR_ID e se a conta tem permissão para convidar participantes.'
    );
  }

  const meetLink =
    event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ?? null;

  return {
    eventId: event.id,
    htmlLink: event.htmlLink,
    meetLink,
    sameAccountAsGuest,
  };
}

/** Eventos futuros no calendário cujo título sugere sessão de diagnóstico (agendamento via site). */
export async function countUpcomingDiagnosticEvents(): Promise<number | null> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary';
    const auth = getOAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
      q: 'diagnóstico',
    });
    const items = res.data.items ?? [];
    let n = 0;
    for (const ev of items) {
      const s = (ev.summary ?? '').toLowerCase();
      if (s.includes('diagnóstico')) n += 1;
    }
    return n;
  } catch (e) {
    console.warn('[countUpcomingDiagnosticEvents]', e);
    return null;
  }
}
