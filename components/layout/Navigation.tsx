'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDiagnosticBookingHref } from '@/components/diagnostic/DiagnosticScheduleButton';

const coreNavItems = [
  { name: 'Quem somos', path: '/quem-somos' },
  { name: 'Biblioteca', path: '/free-content' },
] as const;

const diagnosticNavItem = { name: 'Diagnóstico gratuito' } as const;
const mentorshipNavItem = { name: 'Mentoria', path: '/mentorship-program' } as const;
const adminItem = { name: 'Admin', path: '/admin' } as const;

function navUserLabel(user: { email: string | null; name?: string | null }): string {
  const n = user.name?.trim();
  if (n) return n;
  const e = user.email?.trim();
  if (e) {
    const local = e.split('@')[0];
    if (local) return local;
  }
  return 'Utilizador';
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { loading, role, user, refresh } = useAuth();
  const diagnosticHref = useDiagnosticBookingHref();

  const showAdmin = role === 'admin';
  const showMainNav = Boolean(user);
  const navItems = showMainNav
    ? [
        ...coreNavItems,
        ...(diagnosticHref
          ? [{ name: diagnosticNavItem.name, path: diagnosticHref } as const]
          : []),
        mentorshipNavItem,
        ...(showAdmin ? [adminItem] : []),
      ]
    : [];

  const isActive = (path: string) => {
    const base = path.split('?')[0] ?? path;
    return pathname.startsWith(base);
  };

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      await refresh();
      window.location.href = '/signin';
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 w-full items-center gap-3">
          {/* Marca + links (desktop), à esquerda */}
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6 lg:gap-8">
            <Link
              href={user ? '/dashboard' : '/signin'}
              className="shrink-0 text-base font-bold leading-tight text-[#2563EB] sm:text-lg md:text-xl lg:text-2xl truncate max-w-[min(100%,14rem)] sm:max-w-[min(100%,18rem)] md:max-w-none"
            >
              Programa de Mentoria Método C.O.M.A.V
            </Link>
            <div className="hidden min-w-0 items-center gap-x-4 lg:gap-x-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                      : 'text-gray-700 hover:text-[#2563EB]'
                  } whitespace-nowrap px-1 py-2 text-sm font-medium transition-colors`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Nome + Entrar/Sair colados à direita do contentor; hamburger só no mobile */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {!loading && !user && (
              <Link
                href="/signin"
                className="shrink-0 cursor-pointer rounded-lg border border-[#2563EB]/40 bg-white px-3 py-1.5 text-sm font-semibold text-[#2563EB] shadow-sm transition hover:border-[#2563EB] hover:bg-blue-50/80 whitespace-nowrap"
              >
                Entrar
              </Link>
            )}
            {!loading && user && (
              <>
                <span
                  className="max-w-[7rem] truncate text-right text-xs font-medium text-gray-700 sm:max-w-[12rem] sm:text-sm md:max-w-[16rem] lg:max-w-[20rem]"
                  title={user.email ?? undefined}
                >
                  {navUserLabel(user)}
                </span>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Sair
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer p-1 text-gray-700 hover:text-[#2563EB] focus:outline-none md:hidden"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`${
                  isActive(item.path) ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
