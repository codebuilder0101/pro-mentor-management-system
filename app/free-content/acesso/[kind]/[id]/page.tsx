import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import CatalogMaterialAccessClient from '@/components/free-content/CatalogMaterialAccessClient';
import { getCatalogDocumentById, getCatalogVideoById } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Kind = 'video' | 'document';

type Props = { params: Promise<{ kind: string; id: string }> };

function parseKind(s: string): Kind | null {
  if (s === 'video' || s === 'document') return s;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind: raw, id } = await params;
  const kind = parseKind(raw);
  if (!kind) return { title: 'Acesso · Biblioteca' };
  try {
    const row = kind === 'video' ? await getCatalogVideoById(id) : await getCatalogDocumentById(id);
    if (!row) return { title: 'Material · Biblioteca' };
    return {
      title: `Acesso: ${row.name} · Biblioteca`,
      description: 'Consulte o material com o email utilizado no pagamento.',
    };
  } catch {
    return { title: 'Biblioteca' };
  }
}

export default async function CatalogAccessPage({ params }: Props) {
  const { kind: raw, id } = await params;
  const kind = parseKind(raw);
  if (!kind) notFound();

  let row: Awaited<ReturnType<typeof getCatalogVideoById>> | Awaited<ReturnType<typeof getCatalogDocumentById>>;
  try {
    row = kind === 'video' ? await getCatalogVideoById(id) : await getCatalogDocumentById(id);
  } catch {
    throw new Error('Não foi possível carregar o material.');
  }
  if (!row) notFound();

  const typeLabel = kind === 'video' ? 'Vídeo' : 'Documento / e-book';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100/90">
      <section className="border-b border-gray-200/80 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/free-content" className="text-[#2563EB] font-medium hover:underline">
              Biblioteca
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Acesso ao material</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] mb-1">{typeLabel}</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{row.name}</h1>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden !p-6 sm:!p-8">
            <CatalogMaterialAccessClient kind={kind} catalogId={id} materialName={row.name} />
          </Card>
        </div>
      </section>
    </div>
  );
}
