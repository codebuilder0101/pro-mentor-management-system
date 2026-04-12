'use client';

import Link from 'next/link';
import { useDiagnosticBookingHref } from '@/components/diagnostic/DiagnosticScheduleButton';

export default function FooterQuickLinks() {
  const diagnosticHref = useDiagnosticBookingHref();

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
