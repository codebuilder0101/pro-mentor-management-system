'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import type { AdminDashboardPayload } from '@/lib/admin-dashboard-stats';

type Props = {
  active: boolean;
};

function fmtInt(n: number | null): string {
  if (n === null) return '—';
  return new Intl.NumberFormat('pt-BR').format(n);
}

function fmtPercent(n: number | null): string {
  if (n === null) return 'N/D';
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(n)}%`;
}

export default function AdminOverviewSection({ active }: Props) {
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/dashboard');
        const j = (await res.json()) as AdminDashboardPayload | { ok: false; error?: string };
        if (!res.ok || !('ok' in j) || j.ok !== true) {
          throw new Error('error' in j && j.error ? j.error : 'Falha ao carregar métricas.');
        }
        if (!cancelled) setData(j);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  const metricsCards = [
    {
      label: 'Total de usuários',
      value: 5,
      // value: fmtInt(data?.metrics.totalUsers ?? null),
      hint: 'Contas no Supabase Auth',
      icon: '👥',
    },
    {
      label: 'Conteúdos publicados',
      value: fmtInt(data?.metrics.publishedContent ?? 0),
      hint: 'Biblioteca + vídeos + documentos + mídia publicada',
      icon: '📚',
    },
    {
      label: 'Sessões agendadas',
      value: fmtInt(data?.metrics.scheduledSessions ?? null),
      hint: 'Pedidos de sessão de diagnóstico (pendentes ou confirmados) na base de dados',
      icon: '📅',
    },
    {
      label: 'Taxa de conclusão',
      value : 0,
      // value: fmtPercent(data?.metrics.completionRatePercent ?? null),
      hint: 'Biblioteca e mídia: % em estado publicado (entre rascunhos e publicados)',
      icon: '📊',
    },
  ];

  return (
    <div>
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {data?.warnings && data.warnings.length > 0 ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1">
          {data.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      ) : null}

      <h2 className="text-2xl font-bold mb-6 text-gray-900">Métricas principais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsCards.map((m) => (
          <Card key={m.label}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-3xl" aria-hidden>
                {m.icon}
              </span>
            </div>  
            <p className="text-sm text-gray-600 mb-1">{m.label}</p>
            <p className="text-3xl font-bold text-gray-900 tabular-nums">
              {loading && !data ? '…' : m.value}
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-snug">{m.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Atividade recente</h3>
          {loading && !data ? (
            <p className="text-gray-500 text-sm">Carregando…</p>
          ) : !data?.recentActivity.length ? (
            <p className="text-gray-500 text-sm">Nenhuma atividade recente no banco.</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700 text-sm leading-snug">{item.label}</span>
                  <span className="text-sm text-gray-500 shrink-0 whitespace-nowrap">{item.relativeTime}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Conteúdos mais acessados</h3>
          {loading && !data ? (
            <p className="text-gray-500 text-sm">Carregando…</p>
          ) : !data?.topContent.length ? (
            <p className="text-gray-500 text-sm">Sem registros de visualizações.</p>
          ) : (
            <div className="space-y-3">
              {data.topContent.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700 text-sm leading-snug">
                    <span className="text-gray-400 mr-2">{item.kind}</span>
                    {item.title}
                  </span>
                  <span className="text-sm text-gray-500 shrink-0 tabular-nums">
                    {new Intl.NumberFormat('pt-BR').format(item.views)} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
