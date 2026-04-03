'use client';

import { useState, FormEvent } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ScheduleSessionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Session request:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Solicitação enviada</h2>
            <p className="text-lg text-gray-600 mb-6">
              Recebemos seu pedido de agendamento da sessão de entendimento para{' '}
              <strong>{formData.date}</strong> às <strong>{formData.time}</strong>.
            </p>
            <p className="text-gray-600 mb-8">
              Entraremos em contato pelo email <strong>{formData.email}</strong> ou telefone{' '}
              <strong>{formData.phone}</strong> para confirmar o horário e enviar o link da reunião.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  date: '',
                  time: '',
                  message: '',
                });
              }}
            >
              Novo agendamento
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-100 font-semibold uppercase tracking-wide text-sm mb-2">
            Adapte-se para Prosperar
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sessão de diagnóstico gratuita</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Meia hora ou um pouco mais para você contar onde está apertando, o que quer mudar e tirar
            dúvida sobre mentoria, palestra ou treinamento. Sem vendedor enchendo o saco no final.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">O que é esta sessão?</h2>
              <p className="text-gray-600 mb-4">
                Não é palestra gravada nem “fechamento” de pacote. É conversa para entender seu
                contexto e ver se faz sentido seguir com mentoria, algo em grupo ou formato
                corporativo.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Alinhamento sobre metas de carreira e desafios atuais</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Esclarecimento de dúvidas sobre a jornada em fases e modalidades</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Indicação de próximos passos, quando houver aderência mútua</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Duração aproximada de 45 minutos por videoconferência</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>100% gratuita nesta etapa, sem obrigação de contratação</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-blue-50">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Horários disponíveis</h2>
              <p className="text-gray-600 mb-4">
                Atendimento em dias úteis, nos horários abaixo (confirmação após envio do formulário):
              </p>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="bg-white px-3 py-2 rounded text-center text-gray-700 font-medium"
                  >
                    {slot}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">* Horários no fuso de Brasília (GMT-3)</p>
            </Card>
          </div>

          <Card>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Agendar conversa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Data preferencial *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Horário preferencial *
                  </label>
                  <select
                    id="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
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

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Contexto (opcional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Conte brevemente sua situação atual, objetivos e o que gostaria de explorar nesta conversa..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Enviar pedido de agendamento
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
