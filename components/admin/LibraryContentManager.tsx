'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { LibraryContentType, LibraryItem, LibraryStatus } from '@/lib/library-types';
import { centsToReaisField, formatPriceBRL, parseReaisToCents } from '@/lib/format-price';

const TYPES: LibraryContentType[] = ['video', 'ebook', 'article', 'tool', 'guide'];
const STATUSES: LibraryStatus[] = ['published', 'draft'];

type FormState = {
  title: string;
  type: LibraryContentType;
  intro: string;
  description: string;
  preview_image_url: string;
  duration: string;
  pages: string;
  views: string;
  video_url: string;
  material_url: string;
  status: LibraryStatus;
  is_free: boolean;
  price_reais: string;
};

const emptyForm = (): FormState => ({
  title: '',
  type: 'video',
  intro: '',
  description: '',
  preview_image_url: '',
  duration: '',
  pages: '',
  views: '0',
  video_url: '',
  material_url: '',
  status: 'published',
  is_free: true,
  price_reais: '',
});

function itemToForm(item: LibraryItem): FormState {
  const free = item.is_free !== false;
  return {
    title: item.title,
    type: item.type,
    intro: item.intro?.trim() ?? '',
    description: item.description,
    preview_image_url: item.preview_image_url ?? '',
    duration: item.duration ?? '',
    pages: item.pages != null ? String(item.pages) : '',
    views: String(item.views),
    video_url: item.video_url ?? '',
    material_url: item.material_url ?? '',
    status: item.status,
    is_free: free,
    price_reais: !free ? centsToReaisField(item.price_cents) : '',
  };
}

export default function LibraryContentManager() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/library');
      const json = (await res.json()) as { ok?: boolean; items?: LibraryItem[]; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Falha ao listar.');
      }
      setItems(json.items ?? []);
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

  const openEdit = (item: LibraryItem) => {
    setEditingId(item.id);
    setForm(itemToForm(item));
    setModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const parsePages = (): number | null => {
    const t = form.pages.trim();
    if (!t) return null;
    const n = parseInt(t, 10);
    return Number.isFinite(n) ? Math.max(0, n) : null;
  };

  const parseViews = (): number => {
    const n = parseInt(form.views.trim() || '0', 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const submitForm = async () => {
    if (!form.title.trim()) {
      setError('Título é obrigatório.');
      return;
    }
    if (!editingId) {
      setError('Use “Inserir material” para criar novos itens.');
      return;
    }

    let price_cents: number | null = null;
    if (!form.is_free) {
      const cents = parseReaisToCents(form.price_reais);
      if (!cents || cents <= 0) {
        setError('Para conteúdo pago, informe um preço válido em reais (ex.: 49,90).');
        return;
      }
      price_cents = cents;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        intro: form.intro.trim(),
        description: form.description,
        preview_image_url: form.preview_image_url.trim() || null,
        duration: form.duration.trim() || null,
        pages: parsePages(),
        views: parseViews(),
        video_url: form.video_url.trim() || null,
        material_url: form.material_url.trim() || null,
        status: form.status,
        is_free: form.is_free,
        price_cents: form.is_free ? null : price_cents,
      };

      const res = await fetch(`/api/admin/library/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao atualizar.');

      closeModal();
      await loadItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este conteúdo?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/library/${id}`, {
        method: 'DELETE',
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao excluir.');
      await loadItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir.');
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = (t: string) => {
    const m: Record<string, string> = {
      video: 'Vídeo',
      ebook: 'E-book',
      article: 'Artigo',
      tool: 'Ferramenta',
      guide: 'Guia',
    };
    return m[t] ?? t;
  };

  return (
    <div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar conteúdos</h2>
        <Button href="/admin/library/new" variant="primary" className="w-full sm:w-auto">
          Inserir material
        </Button>
      </div>

      <Card>
        {loading && <p className="text-gray-600 py-4">Carregando…</p>}
        {!loading && items.length === 0 && (
          <div className="py-10 px-4 text-center">
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Nenhum material cadastrado. Use o botão para adicionar vídeos ou documentos à biblioteca.
            </p>
            <Button href="/admin/library/new" variant="primary" size="lg">
              Inserir material
            </Button>
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pt-2 pb-4 border-b border-gray-100 mb-2">
              <p className="text-sm text-gray-500">Lista de materiais ({items.length})</p>
              <Button href="/admin/library/new" variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
                Inserir material
              </Button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Título</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Views</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Acesso</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 max-w-xs truncate">{item.title}</td>
                    <td className="py-3 px-4">{typeLabel(item.type)}</td>
                    <td className="py-3 px-4">{item.views}</td>
                    <td className="py-3 px-4 text-sm">
                      {item.is_free !== false ? (
                        <span className="text-green-700 font-medium">Grátis</span>
                      ) : (
                        <span className="text-gray-800">
                          {item.price_cents != null && item.price_cents > 0
                            ? formatPriceBRL(item.price_cents)
                            : 'Pago'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-[#2563EB] hover:underline text-sm mr-3"
                        onClick={() => openEdit(item)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => remove(item.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar conteúdo</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as LibraryContentType }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {typeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Introdução breve</label>
                <textarea
                  value={form.intro}
                  onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
                  rows={2}
                  placeholder="Resumo para cards e modal de download"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Descrição completa</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">URL da imagem de capa</label>
                <input
                  value={form.preview_image_url}
                  onChange={(e) => setForm((f) => ({ ...f, preview_image_url: e.target.value }))}
                  placeholder="https://…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Duração (vídeo)</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="ex: 22 min"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Páginas</label>
                  <input
                    value={form.pages}
                    onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
                    inputMode="numeric"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">URL do vídeo / arquivo (YouTube, Drive…)</label>
                <input
                  value={form.video_url}
                  onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">URL material / link</label>
                <input
                  value={form.material_url}
                  onChange={(e) => setForm((f) => ({ ...f, material_url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_free"
                  type="checkbox"
                  checked={form.is_free}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_free: e.target.checked, price_reais: e.target.checked ? '' : f.price_reais }))
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
                  Conteúdo gratuito (acesso / download na biblioteca)
                </label>
              </div>
              {!form.is_free && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Preço (BRL)</label>
                  <input
                    value={form.price_reais}
                    onChange={(e) => setForm((f) => ({ ...f, price_reais: e.target.value }))}
                    placeholder="ex: 49,90"
                    inputMode="decimal"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as LibraryStatus }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === 'published' ? 'Publicado' : 'Rascunho'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Visualizações</label>
                  <input
                    value={form.views}
                    onChange={(e) => setForm((f) => ({ ...f, views: e.target.value }))}
                    inputMode="numeric"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="button" variant="primary" onClick={submitForm} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
