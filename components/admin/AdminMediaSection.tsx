'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MediaAddModal from '@/components/admin/MediaAddModal';
import type { BookRow } from '@/lib/media-types';
import type { MediaItemListEntry } from '@/lib/media-types';

function typeLabel(t: string): string {
  return t === 'video' ? 'Vídeo' : t === 'book' ? 'Livro' : t;
}

function statusLabel(s: string): string {
  return s === 'published' ? 'Publicado' : 'Rascunho';
}

function statusClass(s: string): string {
  return s === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
}

export default function AdminMediaSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [items, setItems] = useState<MediaItemListEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    const res = await fetch('/api/admin/books');
    const json = (await res.json()) as { ok?: boolean; books?: BookRow[]; error?: string };
    if (!res.ok || !json.ok) throw new Error(json.error || 'Falha ao listar livros.');
    setBooks(json.books ?? []);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/media');
      const json = (await res.json()) as {
        ok?: boolean;
        items?: MediaItemListEntry[];
        error?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Falha ao listar.');
      setItems((json.items ?? []) as MediaItemListEntry[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function removeItem(id: string) {
    if (!confirm('Excluir este item e os ficheiros no armazenamento?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Falha ao excluir.');
      await loadItems();
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Caminho (storage)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Livro</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Views</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    A carregar…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Nenhum item. Clique em + Novo Conteúdo.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-600 max-w-[140px] truncate" title={row.storage_path}>
                      {row.storage_path}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {row.books?.title ?? '—'}
                      {row.books?.path ? (
                        <span className="block text-xs text-gray-500">{row.books.path}</span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">{typeLabel(row.type)}</td>
                    <td className="py-3 px-4">{row.views}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(row.status)}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => void removeItem(row.id)}
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

      <MediaAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void loadItems()}
        books={books}
        loadBooks={loadBooks}
      />
    </div>
  );
}
