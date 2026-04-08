import Link from 'next/link';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Acesso negado',
  description: 'Não tem permissão para aceder a esta área.',
};

export default function AcessoNegadoPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Acesso negado</h1>
        <p className="text-gray-600 leading-relaxed">
          A sua conta não tem permissão para aceder ao painel administrativo. Se precisar de ajuda, contacte um
          administrador.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button href="/" variant="primary" size="lg">
            Voltar ao início
          </Button>
          <Button href="/login" variant="outline" size="lg">
            Iniciar sessão com outra conta
          </Button>
        </div>
      </div>
    </div>
  );
}
