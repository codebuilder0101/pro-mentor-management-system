import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatPriceBRL } from '@/lib/format-price';
import { getCatalogDocumentById, getCatalogVideoById } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Kind = 'video' | 'document';

type Props = { params: Promise<{ kind: string; id: string }> };

function parseKind(s: string): Kind | null {
  if (s === 'video' || s === 'document') return s;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind: kindRaw, id } = await params;
  const kind = parseKind(kindRaw);
  if (!kind) return { title: 'Pagamento · Biblioteca' };
  try {
    const row =
      kind === 'video' ? await getCatalogVideoById(id) : await getCatalogDocumentById(id);
    if (!row) return { title: 'Material · Biblioteca' };
    return {
      title: `Pagamento: ${row.name} · Biblioteca`,
      description: 'Finalize o pagamento para acessar o material com visualização protegida.',
    };
  } catch {
    return { title: 'Pagamento · Biblioteca' };
  }
}

export default async function CatalogPayPage({ params }: Props) {
  const { kind: kindRaw, id } = await params;
  const kind = parseKind(kindRaw);
  if (!kind) notFound();

  let row: Awaited<ReturnType<typeof getCatalogVideoById>> | Awaited<ReturnType<typeof getCatalogDocumentById>>;
  try {
    row = kind === 'video' ? await getCatalogVideoById(id) : await getCatalogDocumentById(id);
  } catch {
    throw new Error('Não foi possível carregar o material.');
  }

  if (!row) notFound();

  if (row.price_cents <= 0) {
    redirect('/free-content');
  }

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
            <span className="text-gray-700 font-medium">Pagamento</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] mb-1">
            Material pago
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{row.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{typeLabel}</p>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden !p-0">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-8 sm:px-8">
              <p className="text-sm text-slate-300 mb-2">Valor</p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">{formatPriceBRL(row.price_cents)}</p>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-xl">
                Após a confirmação do pagamento pela Stripe, o acesso será liberado à visualização
                protegida deste material — sem link público direto para o ficheiro.
              </p>
            </div>

            <div className="px-6 py-8 sm:px-8 space-y-6 text-[15px] text-gray-600 leading-relaxed">
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 text-amber-950 text-sm">
                <p className="font-semibold text-amber-900 mb-1">Checkout em configuração</p>
                <p>
                  O pagamento seguro via Stripe será ativado em breve. Esta página já centraliza o fluxo:
                  daqui será criada a sessão de pagamento e, só após o webhook confirmar sucesso, o
                  acesso será concedido.
                </p>
              </div>

              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Visualização apenas no leitor protegido da plataforma (sem botão de download).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Liberação do acesso somente após evento válido da Stripe (ex.: sessão concluída).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Reembolsos ou falhas de pagamento atualizam o direito de acesso no servidor.</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full sm:flex-1 justify-center opacity-70 cursor-not-allowed"
                  disabled
                  aria-disabled
                >
                  Continuar para pagamento
                </Button>
                <Button href="/free-content" variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                  Voltar à biblioteca
                </Button>
              </div>
              <p className="text-xs text-center text-gray-500">
                Em breve: redirecionamento para o Stripe Checkout após validação no servidor.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
