import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { google, calendar_v3 } from 'googleapis';
import type { ValidatedSchedule } from '@/lib/schedule-validation';

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
};

export async function createDiagnosticSessionEvent(data: ValidatedSchedule): Promise<CreateEventResult> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary';
  const timeZone = process.env.SCHEDULE_TIMEZONE?.trim() || 'America/Sao_Paulo';
  const meetEnabled = process.env.ENABLE_GOOGLE_MEET === 'true' || process.env.ENABLE_GOOGLE_MEET === '1';

  const auth = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

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

  const res = await calendar.events.insert({
    calendarId,
    requestBody,
    conferenceDataVersion: meetEnabled ? 1 : 0,
    sendUpdates: 'all',
  });

  const event = res.data;
  if (!event.id || !event.htmlLink) {
    throw new Error('Resposta inesperada da API do Google Calendar.');
  }

  const meetLink =
    event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ?? null;

  return {
    eventId: event.id,
    htmlLink: event.htmlLink,
    meetLink,
  };
}
