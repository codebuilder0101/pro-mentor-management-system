import { NextResponse } from 'next/server';
import { createDiagnosticSessionEvent } from '@/lib/calendar-service';
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

  try {
    const result = await createDiagnosticSessionEvent(validated.data);
    const body: ScheduleSuccessResponse = {
      ok: true,
      eventId: result.eventId,
      htmlLink: result.htmlLink,
      meetLink: result.meetLink,
      sameAccountAsGuest: result.sameAccountAsGuest,
    };
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar evento.';
    console.error('[api/schedule]', err);

    const isConfig = message.includes('Configuração incompleta');
    const status = isConfig ? 503 : 502;
    const body: ScheduleErrorResponse = {
      ok: false,
      error: isConfig
        ? 'Agendamento indisponível no momento. Tente mais tarde.'
        : 'Não foi possível criar o evento no calendário. Tente novamente ou entre em contato.',
      code: isConfig ? 'SERVER_CONFIG' : 'CALENDAR_ERROR',
    };
    return NextResponse.json(body, { status });
  }
}
