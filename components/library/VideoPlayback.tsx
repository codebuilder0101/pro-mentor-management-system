'use client';

import { useMemo, useState } from 'react';
import { resolveVideoPlayback } from '@/lib/video-embed';

type Props = {
  url: string;
  title: string;
  className?: string;
};

export default function VideoPlayback({ url, title, className = '' }: Props) {
  const [html5Error, setHtml5Error] = useState(false);

  const mode = useMemo(() => resolveVideoPlayback(url), [url]);

  if (!mode) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
        URL de vídeo inválida ou vazia.
      </div>
    );
  }

  if (mode.kind === 'iframe') {
    return (
      <div
        className={`rounded-xl overflow-hidden shadow-lg bg-black aspect-video ${className}`}
      >
        <iframe
          title={title}
          src={mode.src}
          className="w-full h-full min-h-[240px]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {html5Error && (
        <div className="rounded-lg bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          Não foi possível reproduzir este arquivo no navegador. Confirme que a URL aponta para um
          vídeo direto (ex.: .mp4) acessível publicamente.
        </div>
      )}
      <video
        key={mode.src}
        className="w-full max-h-[70vh] rounded-lg bg-black"
        controls
        preload="metadata"
        src={mode.src}
        onError={() => setHtml5Error(true)}
        onLoadedData={() => setHtml5Error(false)}
      >
        Seu navegador não suporta reprodução de vídeo HTML5.
      </video>
    </div>
  );
}
