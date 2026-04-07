import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Pagamento concluído · Biblioteca',
  description: 'Obrigado. O acesso é confirmado após a Stripe validar o pagamento.',
};

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function CatalogPaySuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100/90 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-lg">
        <Card className="border border-gray-100 shadow-xl shadow-gray-200/50 !p-8 text-center">
          <div className="mb-4 text-4xl" aria-hidden>
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Obrigado pelo pagamento</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600 text-left">
            Se o pagamento foi aprovado, o acesso ao material será ativado em instantes, assim que a
            Stripe enviar a confirmação ao nosso servidor. Se fechar esta página antes, não se preocupe:
            o webhook regista o estado corretamente.
          </p>
          {sessionId ? (
            <p className="mt-3 text-left text-xs font-mono text-gray-400 break-all">
              Ref.: {sessionId}
            </p>
          ) : null}
          <div className="mt-8 flex justify-center">
            <Button href="/free-content" variant="primary" size="lg" className="min-w-[220px] justify-center">
              Voltar à biblioteca
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
