'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import AdminContentSection from '@/components/admin/AdminContentSection';
import AdminArtigosSection from '@/components/admin/AdminArtigosSection';
import AdminOverviewSection from '@/components/admin/AdminOverviewSection';

type TabType = 'overview' | 'content' | 'sessions' | 'artigos';

type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface SessionRequest {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  status: SessionStatus;
}

type ApiSessionRow = {
  id: string;
  guest_name: string;
  guest_email: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
};

function mapSessionRow(row: ApiSessionRow): SessionRequest | null {
  const st = row.status;
  if (st !== 'pending' && st !== 'confirmed' && st !== 'completed' && st !== 'cancelled') return null;
  return {
    id: row.id,
    name: row.guest_name,
    email: row.guest_email,
    date: row.preferred_date,
    time: row.preferred_time,
    status: st,
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<SessionRequest | null>(null);
  const [approveSubmitting, setApproveSubmitting] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approveSuccess, setApproveSuccess] = useState<{ eventUrl: string | null; warning: string | null } | null>(null);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const res = await fetch('/api/admin/diagnostic-sessions');
      const j = (await res.json()) as { ok?: boolean; sessions?: ApiSessionRow[]; error?: string };
      if (!res.ok || j.ok !== true || !Array.isArray(j.sessions)) {
        throw new Error(j.error ?? 'Falha ao carregar solicitações.');
      }
      const mapped = j.sessions.map(mapSessionRow).filter((r): r is SessionRequest => r !== null);
      setSessionRequests(mapped);
    } catch (e) {
      setSessionsError(e instanceof Error ? e.message : 'Erro ao carregar.');
      setSessionRequests([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'sessions') return;
    void loadSessions();
  }, [activeTab, loadSessions]);

  const updateSessionStatus = async (id: string, newStatus: SessionStatus) => {
    const previous = sessionRequests;
    setUpdatingSessionId(id);
    setSessionsError(null);
    setSessionRequests((rows) => rows.map((req) => (req.id === id ? { ...req, status: newStatus } : req)));
    try {
      const res = await fetch(`/api/admin/diagnostic-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || j.ok !== true) {
        throw new Error(j.error ?? 'Não foi possível atualizar.');
      }
    } catch {
      setSessionRequests(previous);
      setSessionsError('Não foi possível atualizar o estado. Tente novamente.');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const openApproveModal = (request: SessionRequest) => {
    setApproveError(null);
    setApproveSuccess(null);
    setApproveTarget(request);
  };

  const closeApproveModal = () => {
    if (approveSubmitting) return;
    setApproveTarget(null);
    setApproveError(null);
    setApproveSuccess(null);
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    const target = approveTarget;
    setApproveSubmitting(true);
    setApproveError(null);
    setUpdatingSessionId(target.id);
    try {
      const res = await fetch(`/api/admin/diagnostic-sessions/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        calendarEventUrl?: string | null;
        calendarWarning?: string | null;
      };
      if (!res.ok || j.ok !== true) {
        throw new Error(j.error ?? 'Não foi possível aprovar.');
      }
      setSessionRequests((rows) =>
        rows.map((req) => (req.id === target.id ? { ...req, status: 'confirmed' } : req))
      );
      setApproveSuccess({
        eventUrl: j.calendarEventUrl ?? null,
        warning: j.calendarWarning ?? null,
      });
    } catch (e) {
      setApproveError(e instanceof Error ? e.message : 'Erro ao aprovar.');
    } finally {
      setApproveSubmitting(false);
      setUpdatingSessionId(null);
    }
  };

  const formatDatePtBr = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR');

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-emerald-100 text-emerald-900',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-slate-200 text-slate-800',
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Aprovado',
      cancelled: 'Rejeitado',
      completed: 'Concluído',
      published: 'Publicado',
      draft: 'Rascunho',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-blue-100">Gerencie conteúdos, sessões e métricas da plataforma</p>
        </div>
      </section>

      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'content'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Conteúdos
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sessões
            </button>
            <button
              onClick={() => setActiveTab('artigos')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'artigos'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Artigos
            </button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'overview' && <AdminOverviewSection active />}

          {activeTab === 'content' && <AdminContentSection />}

          {activeTab === 'artigos' && <AdminArtigosSection />}

          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Solicitações de Sessão</h2>
                <button
                  type="button"
                  onClick={() => void loadSessions()}
                  className="text-sm font-semibold text-[#2563EB] hover:text-blue-800"
                  disabled={sessionsLoading}
                >
                  Atualizar
                </button>
              </div>
              {sessionsError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {sessionsError}
                </div>
              ) : null}
              <Card>
                <div className="overflow-x-auto">
                  {sessionsLoading ? (
                    <p className="p-6 text-gray-600 text-sm">Carregando…</p>
                  ) : sessionRequests.length === 0 ? (
                    <p className="p-6 text-gray-600 text-sm">Nenhuma solicitação registrada.</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Horário</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionRequests.map((request) => (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{request.name}</td>
                            <td className="py-3 px-4">{request.email}</td>
                            <td className="py-3 px-4">
                              {new Date(`${request.date}T12:00:00`).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4">{request.time}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                  request.status
                                )}`}
                              >
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {request.status === 'pending' ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={updatingSessionId === request.id}
                                    onClick={() => openApproveModal(request)}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Aprovar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updatingSessionId === request.id}
                                    onClick={() => void updateSessionStatus(request.id, 'cancelled')}
                                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Rejeitar
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {approveTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 id="approve-modal-title" className="text-lg font-semibold text-gray-900">
                Confirmar agendamento
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Um evento será criado no Google Calendar do administrador e um convite enviado ao participante.
              </p>
            </div>

            <div className="px-6 py-4 text-sm">
              {approveSuccess ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                    Sessão aprovada com sucesso.
                    {approveSuccess.eventUrl ? (
                      <>
                        {' '}
                        <a
                          href={approveSuccess.eventUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold underline"
                        >
                          Abrir evento no Google Calendar
                        </a>
                        .
                      </>
                    ) : null}
                  </div>
                  {approveSuccess.warning ? (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-900">
                      Status atualizado, mas o evento não foi criado: {approveSuccess.warning}
                    </div>
                  ) : null}
                </div>
              ) : (
                <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-gray-700">
                  <dt className="font-semibold">Nome</dt>
                  <dd>{approveTarget.name}</dd>
                  <dt className="font-semibold">Email</dt>
                  <dd className="break-all">{approveTarget.email}</dd>
                  <dt className="font-semibold">Data</dt>
                  <dd>{formatDatePtBr(approveTarget.date)}</dd>
                  <dt className="font-semibold">Horário</dt>
                  <dd>{approveTarget.time}</dd>
                  <dt className="font-semibold">Duração</dt>
                  <dd>60 minutos</dd>
                  <dt className="font-semibold">Calendário</dt>
                  <dd className="break-all">omixamovatsug@gmail.com</dd>
                </dl>
              )}

              {approveError ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                  {approveError}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
              {approveSuccess ? (
                <button
                  type="button"
                  onClick={closeApproveModal}
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Fechar
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeApproveModal}
                    disabled={approveSubmitting}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void confirmApprove()}
                    disabled={approveSubmitting}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {approveSubmitting ? 'Agendando…' : 'OK, agendar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
