'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import AdminContentSection from '@/components/admin/AdminContentSection';
import AdminArtigosSection from '@/components/admin/AdminArtigosSection';
import AdminOverviewSection from '@/components/admin/AdminOverviewSection';

type TabType = 'overview' | 'content' | 'sessions' | 'artigos';

interface SessionRequest {
  id: number;
  name: string;
  email: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([
    { id: 1, name: 'João Silva', email: 'joao@email.com', date: '2026-04-15', time: '10:00', status: 'pending' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', date: '2026-04-16', time: '14:00', status: 'confirmed' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', date: '2026-04-10', time: '09:00', status: 'completed' },
  ]);

  const updateSessionStatus = (id: number, newStatus: 'pending' | 'confirmed' | 'completed') => {
    setSessionRequests(
      sessionRequests.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      published: 'Publicado',
      draft: 'Rascunho',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-blue-100">Gerencie conteúdos, sessões e métricas da plataforma</p>
        </div>
      </section>

      {/* Tabs */}
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

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && <AdminOverviewSection active />}

          {/* Content Tab */}
          {activeTab === 'content' && <AdminContentSection />}

          {activeTab === 'artigos' && <AdminArtigosSection />}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Solicitações de Sessão</h2>
              </div>
              <Card>
                <div className="overflow-x-auto">
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
                            {new Date(request.date).toLocaleDateString('pt-BR')}
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
                            <select
                              value={request.status}
                              onChange={(e) =>
                                updateSessionStatus(
                                  request.id,
                                  e.target.value as 'pending' | 'confirmed' | 'completed'
                                )
                              }
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pendente</option>
                              <option value="confirmed">Confirmar</option>
                              <option value="completed">Concluído</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
