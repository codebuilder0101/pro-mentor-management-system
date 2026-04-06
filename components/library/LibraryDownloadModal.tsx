'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import VideoPlayback from '@/components/library/VideoPlayback';
import type { LibraryItem } from '@/lib/library-types';
import { getLibraryIntro, isLibraryItemFree } from '@/lib/library-access';
import { formatPriceBRL } from '@/lib/format-price';

type Phase = 'details' | 'pay';

type Props = {
  item: LibraryItem | null;
  open: boolean;
  onClose: () => void;
};


function typeLabel(type: LibraryItem['type']): string {
  const m: Record<LibraryItem['type'], string> = {
    video: 'Vídeo',
    ebook: 'Livro / e-book',
    article: 'Artigo',
    tool: 'Ferramenta',
    guide: 'Guia',
  };
  return m[type];
}

export default function LibraryDownloadModal({ item, open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('details');
  const [showPlayer, setShowPlayer] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    if (open && item) {
      setPhase('details');
      setShowPlayer(false);
      setAccessError(null);
    }
  }, [open, item?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  const intro = getLibraryIntro(item);
  const free = isLibraryItemFree(item);
  const meta =
    item.type === 'video'
      ? item.duration || '—'
      : item.pages != null
        ? `${item.pages} páginas`
        : '—';

  function handleInnerDownload() {
    if (!item) return;
    setAccessError(null);
    if (!free) {
      setPhase('pay');
      return;
    }
    if (item.type === 'video') {
      const u = item.video_url?.trim();
      if (!u) {
        setAccessError('URL do vídeo não configurada.');
        return;
      }
      setShowPlayer(true);
      return;
    }
    const u = item.material_url?.trim();
    if (u) {
      window.open(u, '_blank', 'noopener,noreferrer');
      onClose();
      return;
    }
    window.location.href = `/free-content/${item.id}`;
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h2 id="download-modal-title" className="text-xl font-bold text-gray-900 pr-8">
              {item.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none shrink-0"
            >
              ×
            </button>
          </div>

          {phase === 'details' && (
            <>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                {item.preview_image_url?.trim() ? (
                  <Image
                    src={item.preview_image_url.trim()}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 32rem) 100vw, 32rem"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl bg-gradient-to-br from-blue-50 to-gray-100">
                    {item.type === 'video' ? '🎥' : '📄'}
                  </div>
                )}
              </div>

              <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide mb-1">
                {typeLabel(item.type)}
              </p>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{intro}</p>

              <dl className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-6 border-t border-gray-100 pt-4">
                <dt>Duração / extensão</dt>
                <dd className="text-gray-900 font-medium text-right">{meta}</dd>
                <dt>Visualizações</dt>
                <dd className="text-gray-900 font-medium text-right">{item.views}</dd>
              </dl>

              {accessError && (
                <div className="mb-4 rounded-lg bg-red-50 text-red-800 px-3 py-2 text-sm">{accessError}</div>
              )}

              {showPlayer && item.video_url?.trim() && (
                <div className="mb-6">
                  <VideoPlayback url={item.video_url.trim()} title={item.title} />
                </div>
              )}

              {!showPlayer && (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={handleInnerDownload}
                >
                  Download
                </Button>
              )}
              {showPlayer && item.type === 'video' && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Reprodução acima. Feche esta janela quando terminar.
                </p>
              )}
            </>
          )}

          {phase === 'pay' && (
            <div className="text-center space-y-6">
              <p className="text-gray-600 text-sm">
                Este material é pago. Escolha uma forma de pagamento para liberar o acesso.
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {item.price_cents != null && item.price_cents > 0
                  ? formatPriceBRL(item.price_cents)
                  : 'Preço sob consulta'}
              </p>
              <Button
                href={`/mentorship-program?ref=library&item=${encodeURIComponent(item.id)}`}
                variant="primary"
                className="w-full"
                size="lg"
              >
                Pagar
              </Button>
              <button
                type="button"
                onClick={() => {
                  setPhase('details');
                }}
                className="text-sm text-[#2563EB] hover:underline"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
