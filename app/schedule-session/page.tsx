'use client';

import { useState, FormEvent } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm placeholder:text-gray-400 transition duration-200 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-500/12 disabled:opacity-60 disabled:cursor-not-allowed';

const labelClass = 'mb-2 block text-sm font-semibold tracking-tight text-gray-900';

const hintClass = 'text-sm text-gray-500 leading-relaxed';

const ReqMark = () => (
  <abbr className="text-red-600 no-underline font-normal" title="obrigatório">
    *
  </abbr>
);

export default function ScheduleSessionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    mentorshipModel: '' as '' | 'presencial' | 'online',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scheduleResult, setScheduleResult] = useState<{
    htmlLink: string;
    meetLink: string | null;
    sameAccountAsGuest: boolean;
  } | null>(null);

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferredDate: formData.date,
          preferredTime: formData.time,
          mentorshipModel: formData.mentorshipModel,
          context: formData.message,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        details?: string[];
        eventId?: string;
        htmlLink?: string;
        meetLink?: string | null;
        sameAccountAsGuest?: boolean;
      };

      const eventId = data.eventId;
      const htmlLink = data.htmlLink;
      const hasValidEvent =
        typeof eventId === 'string' &&
        eventId.length > 0 &&
        typeof htmlLink === 'string' &&
        htmlLink.startsWith('http');

      if (!res.ok || !data.ok || !hasValidEvent) {
        const detail =
          Array.isArray(data.details) && data.details.length > 0
            ? ` ${data.details.join(' ')}`
            : '';
        setSubmitError((data.error ?? 'Não foi possível enviar o pedido.') + detail);
        return;
      }

      setScheduleResult({
        htmlLink,
        meetLink: data.meetLink ?? null,
        sameAccountAsGuest: Boolean(data.sameAccountAsGuest),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Falha de rede. Verifique sua conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full mx-auto">
          <Card className="text-center border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden !p-0">
            <div className="bg-gradient-to-br from-emerald-50 to-white px-8 pt-10 pb-6 border-b border-gray-100">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl shadow-inner"
                aria-hidden
              >
                ✓
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Solicitação enviada
              </h2>
            </div>
            <div className="px-8 py-8 space-y-5 text-left text-[15px] leading-relaxed text-gray-600">
              <p>
                Recebemos seu pedido de agendamento da sessão de entendimento para{' '}
                <strong className="font-semibold text-gray-900">{formData.date}</strong> às{' '}
                <strong className="font-semibold text-gray-900">{formData.time}</strong>
                {formData.mentorshipModel === 'presencial' ? (
                  <>
                    , com preferência por formato <strong className="font-semibold text-gray-900">presencial</strong>.
                  </>
                ) : formData.mentorshipModel === 'online' ? (
                  <>
                    , com preferência por formato <strong className="font-semibold text-gray-900">online</strong>.
                  </>
                ) : null}
              </p>
              {scheduleResult?.sameAccountAsGuest ? (
                <p>
                  O compromisso foi criado na <strong className="font-semibold text-gray-900">mesma conta Google</strong>{' '}
                  usada pelo formulário (<strong className="font-semibold text-gray-900">{formData.email}</strong>). O
                  Google <strong>não envia email de convite</strong> quando você é o organizador e o convidado ao mesmo
                  tempo — o evento já está no seu Google Agenda. Use o link abaixo se não aparecer de imediato.
                </p>
              ) : (
                <p>
                  Um convite foi enviado para{' '}
                  <strong className="font-semibold text-gray-900">{formData.email}</strong> com a data e o horário
                  solicitados. Confira também a pasta de spam.
                </p>
              )}
              {scheduleResult?.htmlLink ? (
                <p>
                  <a
                    href={scheduleResult.htmlLink}
                    className="inline-flex items-center gap-1 font-semibold text-[#2563EB] underline decoration-blue-200 underline-offset-4 hover:decoration-[#2563EB]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir evento no Google Calendar
                  </a>
                </p>
              ) : null}
              {formData.mentorshipModel === 'online' ? (
                scheduleResult?.meetLink ? (
                  <p>
                    <a
                      href={scheduleResult.meetLink}
                      className="inline-flex items-center gap-1 font-semibold text-[#2563EB] underline decoration-blue-200 underline-offset-4 hover:decoration-[#2563EB]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Link do Google Meet
                    </a>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    O link da videoconferência virá no convite por email. Se precisarmos ajustar o horário,
                    entraremos em contato pelo telefone{' '}
                    <strong className="font-semibold text-gray-900">{formData.phone}</strong>.
                  </p>
                )
              ) : (
                <p className="text-gray-600">
                  Formato <strong className="font-semibold text-gray-900">presencial</strong> — combinaremos o local ou os
                  próximos passos pelo telefone{' '}
                  <strong className="font-semibold text-gray-900">{formData.phone}</strong>.
                </p>
              )}
            </div>
            <div className="border-t border-gray-100 bg-gray-50/80 px-8 py-6 flex justify-center">
              <Button
                className="min-w-[240px] shadow-md"
                onClick={() => {
                  setSubmitted(false);
                  setScheduleResult(null);
                  setSubmitError(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    date: '',
                    time: '',
                    mentorshipModel: '',
                    message: '',
                  });
                }}
              >
                Novo agendamento
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100/90">
      <section className="bg-gradient-to-br from-[#2563EB] via-blue-600 to-blue-800 text-white py-16 md:py-20 shadow-md shadow-blue-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-100 font-semibold uppercase tracking-wide text-sm mb-2">
            Adapte-se para Prosperar
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sessão de diagnóstico gratuita</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto text-justify">
            Meia hora ou um pouco mais para você contar onde está apertando, o que quer mudar e tirar
            dúvida sobre mentoria, palestra ou treinamento. Sem vendedor enchendo o saco no final.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
            <Card className="border border-gray-100 shadow-lg shadow-gray-200/40 !p-7 md:!p-8">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4 text-gray-900">
                O que é esta sessão?
              </h2>
              <p className="text-[15px] text-gray-600 mb-5 leading-relaxed text-justify">
                Não é palestra gravada nem “fechamento” de pacote. É conversa para entender seu
                contexto e ver se faz sentido seguir com mentoria, algo em grupo ou formato
                corporativo.
              </p>
              <ul className="space-y-3.5 text-[15px] text-gray-600 leading-relaxed">
                <li className="flex gap-3 items-start">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  <span>Alinhamento sobre metas de carreira e desafios atuais</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  <span>Esclarecimento de dúvidas sobre a jornada em fases e modalidades</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  <span>Indicação de próximos passos, quando houver aderência mútua</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  <span>Duração aproximada de 45 minutos por videoconferência</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  <span>100% gratuita nesta etapa, sem obrigação de contratação</span>
                </li>
              </ul>
            </Card>

            <Card className="border border-blue-100/80 bg-gradient-to-br from-blue-50/90 to-white shadow-lg shadow-blue-100/50 !p-7 md:!p-8">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 text-gray-900">
                Horários disponíveis
              </h2>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-5">
                Atendimento em dias úteis, nos horários abaixo (confirmação após envio do formulário):
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="rounded-lg border border-blue-100/60 bg-white px-3 py-2.5 text-center text-sm font-semibold text-gray-800 shadow-sm"
                  >
                    {slot}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Horários no fuso de Brasília (GMT-3).
              </p>
            </Card>
          </div>

          <Card className="overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 !p-0">
            <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 px-6 py-6 md:px-10 md:py-8">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                Agendar conversa
              </h2>
              <p className={`${hintClass} mt-2 max-w-2xl`}>
                Preencha os dados com cuidado. Entraremos em contato se precisarmos ajustar data ou horário.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-8 md:px-10 md:py-10 space-y-6">
              {submitError ? (
                <div
                  className="rounded-xl border border-red-200/80 bg-red-50/95 px-4 py-3.5 text-sm text-red-900 shadow-sm"
                  role="alert"
                >
                  <span className="font-semibold">Não foi possível enviar.</span>{' '}
                  <span className="text-red-800/90">{submitError}</span>
                </div>
              ) : null}

              <div>
                <label htmlFor="name" className={labelClass}>
                  Nome completo <ReqMark />
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome como no documento"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email <ReqMark />
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nome@email.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Telefone <ReqMark />
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className={labelClass}>
                    Data preferencial <ReqMark />
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="time" className={labelClass}>
                    Horário preferencial <ReqMark />
                  </label>
                  <select
                    id="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-11`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    }}
                  >
                    <option value="">Selecione um horário</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-5 md:p-6">
                <legend className={`${labelClass} !mb-0 px-1`}>
                  Modelo da mentoria <ReqMark />
                </legend>
                <p className={`${hintClass} px-1 -mt-0.5 mb-1`}>
                  Indique se prefere acompanhamento presencial ou online para prepararmos a conversa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    className={`relative flex cursor-pointer flex-col rounded-xl border-2 px-5 py-4 text-center transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563EB] has-[:focus-visible]:ring-offset-2 ${
                      formData.mentorshipModel === 'online'
                        ? 'border-[#2563EB] bg-white shadow-md shadow-blue-500/10 ring-2 ring-blue-500/15'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mentorshipModel"
                      value="online"
                      required
                      checked={formData.mentorshipModel === 'online'}
                      onChange={handleChange}
                      className="sr-only focus:outline-none"
                    />
                    <span className="text-sm font-semibold text-gray-900">Online</span>
                    <span className="mt-1 text-xs text-gray-500">Videoconferência (Meet, etc.)</span>
                  </label>
                  <label
                    className={`relative flex cursor-pointer flex-col rounded-xl border-2 px-5 py-4 text-center transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563EB] has-[:focus-visible]:ring-offset-2 ${
                      formData.mentorshipModel === 'presencial'
                        ? 'border-[#2563EB] bg-white shadow-md shadow-blue-500/10 ring-2 ring-blue-500/15'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mentorshipModel"
                      value="presencial"
                      checked={formData.mentorshipModel === 'presencial'}
                      onChange={handleChange}
                      className="sr-only focus:outline-none"
                    />
                    <span className="text-sm font-semibold text-gray-900">Presencial</span>
                    <span className="mt-1 text-xs text-gray-500">Encontro presencial combinado</span>
                  </label>
                </div>
              </fieldset>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Contexto <span className="font-normal text-gray-500">(opcional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Conte brevemente sua situação atual, objetivos e o que gostaria de explorar nesta conversa…"
                  className={`${inputClass} min-h-[120px] resize-y`}
                />
              </div>

              <div className="border-t border-gray-100 pt-8">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full py-4 text-base font-semibold shadow-lg shadow-blue-600/25 md:text-[17px]"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando…' : 'Enviar pedido de agendamento'}
                </Button>
                <p className={`${hintClass} mt-3 text-center text-xs`}>
                  Ao enviar, você concorda em receber o convite no email informado.
                </p>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
