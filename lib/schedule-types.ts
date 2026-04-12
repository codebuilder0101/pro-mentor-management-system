export type ScheduleRequestBody = {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  /** Preferência do mentorado para o formato do acompanhamento. */
  mentorshipModel: 'presencial' | 'online';
  context?: string;
};

export type ScheduleSuccessResponse = {
  ok: true;
  eventId: string;
  htmlLink: string;
  meetLink: string | null;
  /** True when o email do formulário é o mesmo da conta Google conectada ao site (o Google não envia convite por email para si mesmo). */
  sameAccountAsGuest: boolean;
};

export type ScheduleErrorResponse = {
  ok: false;
  error: string;
  code?: string;
  details?: string[];
};
