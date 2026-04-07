'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ArtigoModal from '@/components/admin/ArtigoModal';
import type { ArtigoRow } from '@/lib/artigo-types';

export default function AdminArtigosSection() {
  const [artigos, setArtigos] = useState<ArtigoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<ArtigoRow | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/artigos');
      const j = (await res.json()) as { ok?: boolean; artigos?: ArtigoRow[]; error?: string };
      if (!res.ok || !j.ok) throw new Error(j.error || 'Falha ao listar artigos.');
      setArtigos(j.artigos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
      setArtigos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const sorted = useMemo(
    () => [...artigos].sort((a, b) => a.ordem - b.ordem || b.created_at.localeCompare(a.created_at)),
    [artigos]
  );

  function openCreate() {
    setEditRow(null);
    setModalOpen(true);
  }

  function openEdit(row: ArtigoRow) {
    setEditRow(row);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditRow(null);
  }

  async function remove(id: string) {
    if (!confirm('Excluir este registro?')) return;
    try {
      const res = await fetch(`/api/admin/artigos/${id}`, { method: 'DELETE' });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) throw new Error(j.error || 'Exclusão falhou.');
      void loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir.');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Artigos e depoimentos</h2>
        <Button variant="primary" onClick={openCreate}>
          + Novo registro
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
       <tr className="border-b">
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Título / início do texto</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Autor</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Ordem</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Estado</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Carregando…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhum registro. Clique em «Novo registro».
                  </td>
                </tr>
              ) : (
                sorted.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm max-w-xs">
                      <span className="font-medium text-gray-900 line-clamp-2">
                        {row.titulo || row.conteudo.slice(0, 80)}
                        {row.titulo || row.conteudo.length > 80 ? '…' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700">
                      {row.nome_autor ? (
                        <>
                          {row.nome_autor}
                          {row.cargo_autor ? (
                            <span className="block text-xs text-gray-500">{row.cargo_autor}</span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm tabular-nums">{row.ordem}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.publicado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {row.publicado ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-[#2563EB] hover:underline text-sm mr-3"
                        onClick={() => openEdit(row)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => void remove(row.id)}
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

      <ArtigoModal
        open={modalOpen}
        editRow={editRow}
        onClose={closeModal}
        onSuccess={() => void loadAll()}
      />
    </div>
  );
}
