'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ContentAddModal from '@/components/admin/ContentAddModal';
import type { DocumentRow, VideoRow } from '@/lib/catalog-types';
import { formatPriceBRL } from '@/lib/format-price';

type Row = {
  kind: 'video' | 'document';
  id: string;
  title: string;
  typeLabel: string;
  views: string;
  statusLabel: string;
  priceLabel: string;
  sortAt: string;
};

export default function AdminContentSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vr, dr] = await Promise.all([
        fetch('/api/admin/videos'),
        fetch('/api/admin/documents'),
      ]);
      const vj = (await vr.json()) as { ok?: boolean; videos?: VideoRow[]; error?: string };
      const dj = (await dr.json()) as { ok?: boolean; documents?: DocumentRow[]; error?: string };
      if (!vr.ok || !vj.ok) throw new Error(vj.error || 'Falha ao listar vídeos.');
      if (!dr.ok || !dj.ok) throw new Error(dj.error || 'Falha ao listar documentos.');
      setVideos(vj.videos ?? []);
      setDocuments(dj.documents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
      setVideos([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const rows = useMemo<Row[]>(() => {
    const v: Row[] = videos.map((x) => ({
      kind: 'video' as const,
      id: x.id,
      title: x.name,
      typeLabel: 'Vídeo',
      views: '—',
      statusLabel: 'Publicado',
      priceLabel: formatPriceBRL(x.price_cents),
      sortAt: x.created_at,
    }));
    const d: Row[] = documents.map((x) => ({
      kind: 'document' as const,
      id: x.id,
      title: x.name,
      typeLabel: 'Documento',
      views: '—',
      statusLabel: 'Publicado',
      priceLabel: formatPriceBRL(x.price_cents),
      sortAt: x.created_at,
    }));
    return [...v, ...d].sort((a, b) => b.sortAt.localeCompare(a.sortAt));
  }, [videos, documents]);

  async function removeRow(row: Row) {
    const label = row.kind === 'video' ? 'vídeo' : 'documento';
    if (!confirm(`Excluir este ${label}?`)) return;
    try {
      const path = row.kind === 'video' ? `/api/admin/videos/${row.id}` : `/api/admin/documents/${row.id}`;
      const res = await fetch(path, { method: 'DELETE' });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Falha ao excluir.');
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir.');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Conteúdos</h2>
        <Button onClick={() => setModalOpen(true)}>+ Novo Conteúdo</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Título</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Views</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Preço</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    A carregar…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum conteúdo. Clique em + Novo Conteúdo.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.kind}-${row.id}`} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate" title={row.title}>
                      {row.title}
                    </td>
                    <td className="py-3 px-4">{row.typeLabel}</td>
                    <td className="py-3 px-4 text-gray-500">{row.views}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">{row.priceLabel}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => void removeRow(row)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ContentAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void loadAll()}
      />
    </div>
  );
}
