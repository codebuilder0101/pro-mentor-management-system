import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CatalogBrowser, { type CatalogListItem } from '@/components/free-content/CatalogBrowser';
import { formatDurationSeconds } from '@/lib/catalog-format';
import { formatPriceBRL } from '@/lib/format-price';
import { catalogMaterialPublicUrl } from '@/lib/catalog-url';
import { fetchCatalogDocuments, fetchCatalogVideos } from '@/lib/supabase/server';

/** Catálogo vem do Supabase; não pré-renderizar de forma fixa. */
export const dynamic = 'force-dynamic';

function priceLine(cents: number): string {
  return cents > 0 ? formatPriceBRL(cents) : 'Gratuito';
}

function buildCatalogItems(
  videos: Awaited<ReturnType<typeof fetchCatalogVideos>>,
  documents: Awaited<ReturnType<typeof fetchCatalogDocuments>>
): CatalogListItem[] {
  const rows: Array<CatalogListItem & { sort: number }> = [];

  for (const v of videos) {
    rows.push({
      id: v.id,
      type: 'video',
      title: v.name,
      metaLine: formatDurationSeconds(v.duration_seconds),
      priceLine: priceLine(v.price_cents),
      description: 'Vídeo disponível para consulta na biblioteca.',
      href: catalogMaterialPublicUrl('video', v.filepath),
      sort: new Date(v.created_at).getTime(),
    });
  }

  for (const d of documents) {
    rows.push({
      id: d.id,
      type: 'ebook',
      title: d.name,
      metaLine: 'Documento',
      priceLine: priceLine(d.price_cents),
      description: 'Documento disponível para download ou consulta.',
      href: catalogMaterialPublicUrl('document', d.filepath),
      sort: new Date(d.created_at).getTime(),
    });
  }

  rows.sort((a, b) => b.sort - a.sort);
  return rows.map(({ sort: _s, ...item }) => item);
}

export default async function FreeContentPage() {
  let items: CatalogListItem[] = [];
  let loadError: string | null = null;

  try {
    const [videos, documents] = await Promise.all([fetchCatalogVideos(), fetchCatalogDocuments()]);
    items = buildCatalogItems(videos, documents);
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Erro ao carregar o catálogo.';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-100 font-semibold uppercase tracking-wide text-sm mb-2">
            Adapte-se para Prosperar
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Biblioteca de aprendizagem estratégica</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto text-justify">
            Vídeos e livros/e-books para você estudar no seu ritmo e apoiar decisões no trabalho.
            Complementa a mentoria, não substitui conversa com o mentor.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 mb-8 text-sm">
              Não foi possível carregar os materiais. Verifique a ligação ao Supabase e as variáveis de ambiente.
              <span className="block mt-1 text-red-600 font-mono text-xs">{loadError}</span>
            </div>
          ) : null}

          {!loadError && items.length === 0 ? (
            <p className="text-center text-gray-500 py-12 mb-12">
              Ainda não há materiais no catálogo. Adicione vídeos ou documentos no painel administrativo.
            </p>
          ) : null}

          {!loadError && items.length > 0 ? <CatalogBrowser items={items} /> : null}

          <Card className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Quer ir além da biblioteca?</h2>
            <p className="text-lg mb-6 text-blue-100">
              Se quiser ir além do material gravado, o programa de mentoria organiza encontros em fases,
              individual e em grupo, com acompanhamento mais de perto.
            </p>
            <Button href="/mentorship-program" variant="secondary" size="lg">
              Conhecer o programa de mentoria
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
