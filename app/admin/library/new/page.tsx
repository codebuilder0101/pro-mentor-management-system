'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { LibraryContentType, LibraryStatus } from '@/lib/library-types';
import { formatPriceBRL, parseReaisToCents } from '@/lib/format-price';

const TYPES: LibraryContentType[] = ['video', 'ebook', 'article', 'tool', 'guide'];
const STATUSES: LibraryStatus[] = ['published', 'draft'];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function typeLabel(t: LibraryContentType): string {
  const m: Record<LibraryContentType, string> = {
    video: 'Vídeo',
    ebook: 'E-book',
    article: 'Artigo',
    tool: 'Ferramenta',
    guide: 'Guia',
  };
  return m[t];
}

export default function NewLibraryItemPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<LibraryContentType>('video');
  const [intro, setIntro] = useState('');
  const [description, setDescription] = useState('');
  const [preview_image_url, setPreviewImageUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [pages, setPages] = useState('');
  const [video_url, setVideoUrl] = useState('');
  const [material_url, setMaterialUrl] = useState('');
  const [is_free, setIsFree] = useState(true);
  const [price_reais, setPriceReais] = useState('');
  const [status, setStatus] = useState<LibraryStatus>('published');

  async function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setError('A imagem deve ter no máximo 5 MB.');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.');
      e.target.value = '';
      return;
    }

    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/library/upload', {
        method: 'POST',
        body: fd,
      });
      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !json.ok || !json.url) {
        throw new Error(json.error || 'Falha no upload da imagem.');
      }
      setPreviewImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload.');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  }

  function clearCover() {
    setPreviewImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Título é obrigatório.');
      return;
    }

    let price_cents: number | null = null;
    if (!is_free) {
      const cents = parseReaisToCents(price_reais);
      if (!cents || cents <= 0) {
        setError('Para conteúdo pago, informe um preço válido (ex.: 49,90).');
        return;
      }
      price_cents = cents;
    }

    const pagesNum = pages.trim()
      ? Math.max(0, parseInt(pages.trim(), 10) || 0)
      : null;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          type,
          intro: intro.trim(),
          description,
          preview_image_url: preview_image_url.trim() || null,
          duration: duration.trim() || null,
          pages: pagesNum,
          views: 0,
          video_url: video_url.trim() || null,
          material_url: material_url.trim() || null,
          is_free,
          price_cents: is_free ? null : price_cents,
          status,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao criar.');
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="text-sm text-blue-100 hover:text-white underline-offset-2 hover:underline mb-3 inline-block"
          >
            ← Voltar ao painel
          </Link>
          <h1 className="text-3xl font-bold">Novo vídeo ou documento</h1>
          <p className="text-blue-100 mt-2">
            Preencha capa, introdução, arquivos, duração ou páginas, preço e publicação.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-1">Título *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LibraryContentType)}
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
                  <label className="block font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LibraryStatus)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === 'published' ? 'Publicado' : 'Rascunho'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Introdução breve</label>
                <textarea
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  rows={2}
                  placeholder="Aparece nos cards e no primeiro passo do download"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Descrição completa</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Imagem de capa (pré-visualização)
                </label>
                <p className="text-xs text-gray-500 mb-2">JPEG, PNG, WebP ou GIF — até 5 MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleCoverFile}
                  disabled={uploadingCover}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#2563EB] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                />
                {uploadingCover && (
                  <p className="text-xs text-gray-500 mt-2" role="status">
                    Enviando imagem…
                  </p>
                )}
                {preview_image_url && !uploadingCover && (
                  <div className="mt-4 space-y-2">
                    <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <Image
                        src={preview_image_url}
                        alt="Pré-visualização da capa"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearCover}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remover capa
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Duração (vídeo)</label>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="ex: 22 min"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Páginas (documento)</label>
                  <input
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    inputMode="numeric"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">URL do vídeo (YouTube, Google Drive…)</label>
                <input
                  value={video_url}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">URL do arquivo / material (download)</label>
                <input
                  value={material_url}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_free_new"
                  type="checkbox"
                  checked={is_free}
                  onChange={(e) => {
                    setIsFree(e.target.checked);
                    if (e.target.checked) setPriceReais('');
                  }}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_free_new" className="font-medium text-gray-700">
                  Conteúdo gratuito
                </label>
              </div>

              {!is_free && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Preço (BRL)</label>
                  <input
                    value={price_reais}
                    onChange={(e) => setPriceReais(e.target.value)}
                    placeholder="ex: 49,90"
                    inputMode="decimal"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Exemplo de valor: {formatPriceBRL(4990)}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={saving || uploadingCover}>
                  {saving ? 'Salvando…' : 'Publicar item'}
                </Button>
                <Button type="button" variant="outline" href="/admin" disabled={saving}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
