'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import type { DocumentRow, VideoRow } from '@/lib/catalog-types';

type CatalogTab = 'video' | 'document';

export type ContentEditTarget =
  | { kind: 'video'; row: VideoRow }
  | { kind: 'document'; row: DocumentRow };

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Se definido, o modal abre em modo edição (sem alternar tipo). */
  editTarget?: ContentEditTarget | null;
};

const initialVideo = {
  name: '',
  duration_seconds: '',
  filepath: '',
  price_cents: '0',
};

const initialDocument = {
  name: '',
  filepath: '',
  price_cents: '0',
};

export default function ContentAddModal({ open, onClose, onSuccess, editTarget = null }: Props) {
  const [tab, setTab] = useState<CatalogTab>('video');
  const [videoForm, setVideoForm] = useState(initialVideo);
  const [docForm, setDocForm] = useState(initialDocument);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = editTarget !== null;
  const editingVideo = editTarget?.kind === 'video' ? editTarget.row : null;
  const editingDocument = editTarget?.kind === 'document' ? editTarget.row : null;

  const resetAll = useCallback(() => {
    setVideoForm(initialVideo);
    setDocForm(initialDocument);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editingVideo) {
      setTab('video');
      setVideoForm({
        name: editingVideo.name,
        duration_seconds: String(editingVideo.duration_seconds),
        filepath: editingVideo.filepath,
        price_cents: String(editingVideo.price_cents),
      });
      setError(null);
      return;
    }
    if (editingDocument) {
      setTab('document');
      setDocForm({
        name: editingDocument.name,
        filepath: editingDocument.filepath,
        price_cents: String(editingDocument.price_cents),
      });
      setError(null);
      return;
    }
    resetAll();
    setTab('video');
  }, [open, editingVideo, editingDocument, resetAll]);

  function switchTab(next: CatalogTab) {
    if (isEdit) return;
    setTab(next);
    setError(null);
  }

  if (!open) return null;

  async function submitVideo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = videoForm.name.trim();
    const filepath = videoForm.filepath.trim();
    const dur = parseInt(videoForm.duration_seconds.trim(), 10);
    const price = parseInt(videoForm.price_cents.trim() || '0', 10);
    if (!name) {
      setError('Nome do vídeo é obrigatório.');
      return;
    }
    if (!Number.isFinite(dur) || dur < 0 || videoForm.duration_seconds.trim() === '') {
      setError('Duração deve ser um número inteiro ≥ 0.');
      return;
    }
    if (!filepath) {
      setError('Caminho do ficheiro (Storage) é obrigatório.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Preço (centavos) deve ser um inteiro ≥ 0.');
      return;
    }
    const payload = {
      name,
      duration_seconds: dur,
      filepath,
      price_cents: price,
    };
    setSubmitting(true);
    try {
      const url = editingVideo
        ? `/api/admin/videos/${editingVideo.id}`
        : '/api/admin/videos';
      const res = await fetch(url, {
        method: editingVideo ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(
          json.error ||
            (editingVideo ? 'Falha ao atualizar o vídeo.' : 'Falha ao criar o vídeo.')
        );
      }
      resetAll();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : editingVideo ? 'Erro ao atualizar.' : 'Erro ao criar.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitDocument(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = docForm.name.trim();
    const filepath = docForm.filepath.trim();
    const price = parseInt(docForm.price_cents.trim() || '0', 10);
    if (!name) {
      setError('Nome do documento é obrigatório.');
      return;
    }
    if (!filepath) {
      setError('Caminho do ficheiro (Storage) é obrigatório.');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || docForm.price_cents.trim() === '') {
      setError('Preço (centavos) é obrigatório e deve ser um inteiro ≥ 0.');
      return;
    }
    const payload = { name, filepath, price_cents: price };
    setSubmitting(true);
    try {
      const url = editingDocument
        ? `/api/admin/documents/${editingDocument.id}`
        : '/api/admin/documents';
      const res = await fetch(url, {
        method: editingDocument ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(
          json.error ||
            (editingDocument ? 'Falha ao atualizar o documento.' : 'Falha ao criar documento.')
        );
      }
      resetAll();
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : editingDocument ? 'Erro ao atualizar.' : 'Erro ao criar.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const tabBtn = (id: CatalogTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => switchTab(id)}
      className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors ${
        tab === id
          ? 'bg-[#2563EB] text-white shadow'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const modalTitle = editingVideo
    ? 'Editar vídeo'
    : editingDocument
      ? 'Editar documento'
      : 'Novo conteúdo';

  const primaryVideoLabel = submitting
    ? editingVideo
      ? 'A salvar…'
      : 'A criar…'
    : editingVideo
      ? 'Salvar alterações'
      : 'Criar';

  const primaryDocLabel = submitting
    ? editingDocument
      ? 'A salvar…'
      : 'A criar…'
    : editingDocument
      ? 'Salvar alterações'
      : 'Criar';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 id="content-modal-title" className="text-lg font-bold text-gray-900">
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={() => {
              onClose();
              resetAll();
            }}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {!isEdit && (
          <div className="px-6 pt-4 flex gap-2">
            {tabBtn('video', 'Vídeo')}
            {tabBtn('document', 'Documento')}
          </div>
        )}

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {tab === 'video' && (
            <form onSubmit={submitVideo} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  value={videoForm.name}
                  onChange={(e) => setVideoForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Título do vídeo"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Duração (segundos) *</label>
                <input
                  value={videoForm.duration_seconds}
                  onChange={(e) => setVideoForm((f) => ({ ...f, duration_seconds: e.target.value }))}
                  inputMode="numeric"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Caminho no Storage *</label>
                <input
                  value={videoForm.filepath}
                  onChange={(e) => setVideoForm((f) => ({ ...f, filepath: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  placeholder="videos/uuid.mp4"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Caminho do objeto no bucket, não a URL pública.</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Preço (centavos) *</label>
                <input
                  value={videoForm.price_cents}
                  onChange={(e) => setVideoForm((f) => ({ ...f, price_cents: e.target.value }))}
                  inputMode="numeric"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">0 = gratuito. Ex.: 4990 = R$ 49,90</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 border-t">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {primaryVideoLabel}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {tab === 'document' && (
            <form onSubmit={submitDocument} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  value={docForm.name}
                  onChange={(e) => setDocForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nome do documento"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Caminho no Storage *</label>
                <input
                  value={docForm.filepath}
                  onChange={(e) => setDocForm((f) => ({ ...f, filepath: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  placeholder="documents/guia.pdf"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Caminho do objeto no bucket.</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Preço (centavos) *</label>
                <input
                  value={docForm.price_cents}
                  onChange={(e) => setDocForm((f) => ({ ...f, price_cents: e.target.value }))}
                  inputMode="numeric"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">0 = gratuito. Ex.: 4990 = R$ 49,90</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 border-t">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {primaryDocLabel}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
