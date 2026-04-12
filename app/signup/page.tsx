import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';
import { safeInternalPath } from '@/lib/auth/safe-internal-path';

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta com email e senha.',
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const { next: nextRaw } = await searchParams;
  const redirectTo = safeInternalPath(nextRaw);

  return (
    <div className="min-h-[70vh] bg-gray-50 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Criar conta</h1>
        <p className="text-center text-gray-600 text-sm mb-8">
          Escolha um email e uma senha forte. Você será conectado automaticamente após concluir o cadastro.
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <SignupForm redirectTo={redirectTo} />
        </div>
        <p className="text-center mt-6 text-sm text-gray-600">
          Já tem conta?{' '}
          <Link
            href={`/signin?next=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-[#2563EB] hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
