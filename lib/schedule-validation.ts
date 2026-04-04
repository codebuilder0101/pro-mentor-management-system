const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_PHONE = 40;
const MAX_CONTEXT = 5000;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_HH_MM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** Basic RFC 5322–style check; good enough for UX + Calendar API. */
const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function stripControl(s: string): string {
  return s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
}

function isValidCalendarDate(ymd: string): boolean {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export type ValidatedSchedule = {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  context: string;
};

export function validateSchedulePayload(input: unknown): { ok: true; data: ValidatedSchedule } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (input === null || typeof input !== 'object') {
    return { ok: false, errors: ['Corpo da requisição deve ser um objeto JSON.'] };
  }

  const body = input as Record<string, unknown>;

  const name = stripControl(String(body.name ?? '').trim());
  const email = stripControl(String(body.email ?? '').trim().toLowerCase());
  const phone = stripControl(String(body.phone ?? '').trim());
  const preferredDate = String(body.preferredDate ?? '').trim();
  const preferredTime = String(body.preferredTime ?? '').trim();
  const context = stripControl(String(body.context ?? '').trim());

  if (!name) errors.push('Nome é obrigatório.');
  else if (name.length > MAX_NAME) errors.push(`Nome deve ter no máximo ${MAX_NAME} caracteres.`);

  if (!email) errors.push('Email é obrigatório.');
  else if (email.length > MAX_EMAIL || !EMAIL.test(email)) errors.push('Email inválido.');

  if (!phone) errors.push('Telefone é obrigatório.');
  else if (phone.length > MAX_PHONE) errors.push(`Telefone deve ter no máximo ${MAX_PHONE} caracteres.`);

  if (!preferredDate) errors.push('Data preferencial é obrigatória.');
  else if (!ISO_DATE.test(preferredDate) || !isValidCalendarDate(preferredDate)) {
    errors.push('Data preferencial inválida (use AAAA-MM-DD).');
  }

  if (!preferredTime) errors.push('Horário preferencial é obrigatório.');
  else if (!TIME_HH_MM.test(preferredTime)) errors.push('Horário preferencial inválido (use HH:mm).');

  if (context.length > MAX_CONTEXT) errors.push(`Contexto deve ter no máximo ${MAX_CONTEXT} caracteres.`);

  if (errors.length) return { ok: false, errors };

  const padTime = preferredTime.length === 4 ? `0${preferredTime}` : preferredTime;

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      preferredDate,
      preferredTime: padTime,
      context,
    },
  };
}
