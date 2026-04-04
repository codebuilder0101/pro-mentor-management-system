export type ScheduleRequestBody = {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  context?: string;
};

export type ScheduleSuccessResponse = {
  ok: true;
  eventId: string;
  htmlLink: string;
  meetLink: string | null;
};

export type ScheduleErrorResponse = {
  ok: false;
  error: string;
  code?: string;
  details?: string[];
};
