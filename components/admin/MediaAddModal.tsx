'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import type { BookRow } from '@/lib/media-types';
import {
  PREVIEW_MAX_BYTES,
  PREVIEW_MIME,
  VIDEO_MAX_BYTES,
  VIDEO_MIME,
} from '@/lib/media-constants';
import type { MediaItemType } from '@/lib/media-constants';

type BookMode = 'existing' | 'new';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  books: BookRow[];
  loadBooks: () => Promise<void>;
};

function validateBeforeUpload(p: {
  bookMode: BookMode;
  bookId: string;
  newBookTitle: string;
  newBookPath: string;
  mediaType: MediaItemType;
  name: string;
  storagePath: string;
  durationMinutes: string;
  durationSeconds: string;
  previewFile: File | null;
  videoFile: File | null;
}): string | null {
  if (!p.name.trim()) return 'Informe o nome.';
  if (!p.storagePath.trim()) return 'Informe o caminho no armazenamento (storage path).';
  if (p.bookMode === 'existing' && !p.bookId.trim()) return 'Selecione um livro.';
  if (p.bookMode === 'new') {
    if (!p.newBookTitle.trim()) return 'Informe o título do novo livro.';
    if (!p.newBookPath.trim()) return 'Informe o caminho (path) do livro.';
  }
  if (!p.previewFile) return 'Envie uma imagem de pré-visualização.';
  if (p.previewFile.size > PREVIEW_MAX_BYTES || !PREVIEW_MIME.has(p.previewFile.type)) {
    return 'Pré-visualização: JPEG, PNG, WebP ou GIF até 5 MB.';
  }
  if (p.mediaType === 'video') {
    const m = p.durationMinutes.trim() ? parseInt(p.durationMinutes.trim(), 10) : 0;
    const s = p.durationSeconds.trim() ? parseInt(p.durationSeconds.trim(), 10) : 0;
    if (Number.isNaN(m) || Number.isNaN(s) || m < 0 || s < 0) {
      return 'Informe tempo de reprodução válido (minutos e segundos ≥ 0).';
    }
    if (m * 60 + s <= 0) return 'Para vídeo, o tempo de reprodução deve ser maior que zero.';
    if (!p.videoFile) return 'Selecione o arquivo de vídeo.';
    if (p.videoFile.size > VIDEO_MAX_BYTES || !VIDEO_MIME.has(p.videoFile.type)) {
      return 'Vídeo: MP4, MOV ou WebM até 500 MB.';
    }
  } else if (p.videoFile && p.videoFile.size > 0) {
    return 'Para tipo livro, não envie arquivo de vídeo.';
  }
  return null;
}

export default function MediaAddModal({ open, onClose, onSuccess, books, loadBooks }: Props) {
  const [bookMode, setBookMode] = useState<BookMode>('existing');
  const [bookId, setBookId] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookPath, setNewBookPath] = useState('');
  const [mediaType, setMediaType] = useState<MediaItemType>('video');
  const [name, setName] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setBookMode('existing');
    setBookId('');
    setNewBookTitle('');
    setNewBookPath('');
    setMediaType('video');
    setName('');
    setStoragePath('');
    setDurationMinutes('');
    setDurationSeconds('');
    setStatus('draft');
    setPreviewFile(null);
    setVideoFile(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (open) {
      void loadBooks();
      reset();
    }
  }, [open, loadBooks, reset]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateBeforeUpload({
      bookMode,
      bookId,
      newBookTitle,
      newBookPath,
      mediaType,
      name,
      storagePath,
      durationMinutes,
      durationSeconds,
      previewFile,
      videoFile,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    const fd = new FormData();
    fd.append('bookMode', bookMode);
    if (bookMode === 'existing') fd.append('bookId', bookId);
    if (bookMode === 'new') {
      fd.append('newBookTitle', newBookTitle.trim());
      fd.append('newBookPath', newBookPath.trim());
    }
    fd.append('mediaType', mediaType);
    fd.append('name', name.trim());
    fd.append('storagePath', storagePath.trim());
    fd.append('durationMinutes', durationMinutes);
    fd.append('durationSeconds', durationSeconds);
    fd.append('status', status);
    fd.append('preview', previewFile!);
    if (mediaType === 'video' && videoFile) fd.append('video', videoFile);

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: fd,
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Falha ao criar.');
      onSuccess();
      onClose();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-add-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 id="media-add-title" className="text-lg font-bold text-gray-900">
            Novo conteúdo
          </h2>
          <button
            type="button"
            onClick={() => {
              onClose();
              reset();
            }}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 text-sm">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              value={mediaType}
              onChange={(e) => {
                const v = e.target.value as MediaItemType;
                setMediaType(v);
                if (v === 'book') {
                  setVideoFile(null);
                  setDurationMinutes('');
                  setDurationSeconds('');
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="video">Vídeo</option>
              <option value="book">Livro</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Nome *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder={mediaType === 'video' ? 'Nome do vídeo' : 'Nome do livro / obra'}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Pré-visualização (imagem) *</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setPreviewFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#2563EB] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP ou GIF — máx. 5 MB.</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Caminho no armazenamento *</label>
            <input
              value={storagePath}
              onChange={(e) => setStoragePath(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
              placeholder="ex.: videos/onboarding ou livros/guia-2024"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Identificador ou caminho lógico deste item no Storage (gravado em Supabase).
            </p>
          </div>

          {mediaType === 'video' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tempo de reprodução (min) *</label>
                  <input
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tempo de reprodução (seg) *</label>
                  <input
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 -mt-2">Obrigatório para vídeo. Ex.: 1 min + 30 s.</p>

            </>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar e gravar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                reset();
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
