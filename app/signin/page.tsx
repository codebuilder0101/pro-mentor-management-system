import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { safeInternalPath } from '@/lib/auth/safe-internal-path';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta com email e senha.',
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next: nextRaw } = await searchParams;
  const redirectTo = safeInternalPath(nextRaw);

  return (
    <div className="min-h-[70vh] bg-gray-50 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Entrar</h1>
        <p className="text-center text-gray-600 text-sm mb-8">
          Use o email e a senha definidos no cadastro. O painel administrativo fica reservado a perfis com
          papel <strong>admin</strong>.
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
