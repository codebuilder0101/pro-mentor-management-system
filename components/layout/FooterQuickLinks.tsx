'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDiagnosticBookingHref } from '@/components/diagnostic/DiagnosticScheduleButton';

export default function FooterQuickLinks() {
  const { user } = useAuth();
  const diagnosticHref = useDiagnosticBookingHref();

  if (!user) {
    return (
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Conta</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/signin" className="hover:text-white transition-colors">
              Entrar
            </Link>
          </li>
          <li>
            <Link href="/signup" className="hover:text-white transition-colors">
              Criar conta
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">Links rápidos</h4>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/quem-somos" className="hover:text-white transition-colors">
            Quem somos
          </Link>
        </li>
        <li>
          <Link href="/free-content" className="hover:text-white transition-colors">
            Biblioteca
          </Link>
        </li>
        {diagnosticHref ? (
          <li>
            <Link href={diagnosticHref} className="hover:text-white transition-colors">
              Diagnóstico gratuito
            </Link>
          </li>
        ) : null}
        <li>
          <Link href="/mentorship-program" className="hover:text-white transition-colors">
            Programa de mentoria
          </Link>
        </li>
      </ul>
    </div>
  );
}
