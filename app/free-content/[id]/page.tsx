import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import LibraryViewCounter from '@/components/library/LibraryViewCounter';
import VideoPlayback from '@/components/library/VideoPlayback';
import { getPublishedLibraryItemById } from '@/lib/supabase/server';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getPublishedLibraryItemById(id);
    if (!item) return { title: 'Material · Biblioteca' };
    return {
      title: `${item.title} · Biblioteca`,
      description: item.description.slice(0, 160),
    };
  } catch {
    return { title: 'Biblioteca' };
  }
}

export default async function LibraryItemPage({ params }: Props) {
  const { id } = await params;
  let item;
  try {
    item = await getPublishedLibraryItemById(id);
  } catch {
    throw new Error('Falha ao carregar o material.');
  }
  if (!item) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryViewCounter itemId={item.id} />

      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/free-content"
            className="text-sm text-blue-100 hover:text-white underline-offset-2 hover:underline mb-4 inline-block"
          >
            ← Voltar à biblioteca
          </Link>
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide mb-2">
            {item.type === 'video' ? 'Vídeo' : 'Material'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{item.title}</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {item.type === 'video' && item.video_url && (
            <VideoPlayback url={item.video_url} title={item.title} />
          )}

          {item.type === 'video' && !item.video_url && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
              Nenhuma URL de vídeo cadastrada. Adicione um link (YouTube, Google Drive ou arquivo .mp4)
              no painel administrativo.
            </div>
          )}

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {item.duration && <span>{item.duration}</span>}
            {item.pages != null && <span>{item.pages} pág.</span>}
            <span>{item.views} visualizações</span>
          </div>

          {item.material_url && (
            <Button href={item.material_url} variant="primary" size="lg" className="w-full sm:w-auto">
              Abrir material complementar
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
