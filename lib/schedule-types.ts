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
  id: string;
};

export type ScheduleErrorResponse = {
  ok: false;
  error: string;
  code?: string;
  details?: string[];
};
