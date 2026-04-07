'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import AdminContentSection from '@/components/admin/AdminContentSection';

type TabType = 'overview' | 'content' | 'sessions';

interface ContentItem {
  id: number;
  title: string;
  type: string;
  views: number;
  status: 'published' | 'draft';
}

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

  // Mock data
  const metrics = [
    { label: 'Total de Usuários', value: '1,247', change: '+12%', icon: '👥' },
    { label: 'Conteúdos Publicados', value: '10', change: '+3', icon: '📚' },
    { label: 'Sessões Agendadas', value: '28', change: '+7', icon: '📅' },
    { label: 'Taxa de Conclusão', value: '78%', change: '+5%', icon: '📊' },
  ];

  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { id: 1, title: 'Liderança adaptativa em ambientes voláteis', type: 'Vídeo', views: 1243, status: 'published' },
    { id: 2, title: 'Guia: conversas difíceis com equipes', type: 'Guia', views: 892, status: 'published' },
    { id: 3, title: 'Workshop: feedback e cultura', type: 'Curso', views: 0, status: 'draft' },
  ]);

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
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Métricas Principais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric, index) => (
                  <Card key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{metric.icon}</span>
                      <span className="text-sm text-green-600 font-semibold">
                        {metric.change}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Atividade Recente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-700">Nova inscrição: João Silva</span>
                      <span className="text-sm text-gray-500">há 2 horas</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-700">Sessão confirmada: Maria Santos</span>
                      <span className="text-sm text-gray-500">há 5 horas</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-700">Novo conteúdo publicado</span>
                      <span className="text-sm text-gray-500">ontem</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Conteúdos Mais Acessados
                  </h3>
                  <div className="space-y-3">
                    {contentItems
                      .filter((item) => item.status === 'published')
                      .sort((a, b) => b.views - a.views)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b">
                          <span className="text-gray-700">{item.title}</span>
                          <span className="text-sm text-gray-500">{item.views} views</span>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && <AdminContentSection />}

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
