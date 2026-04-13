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
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-md">
      <div className="flex h-16 w-full min-w-0 items-stretch">
        {/* Zona principal: marca + links (cresce; conteúdo até max-w-7xl) */}
        <div className="flex min-w-0 flex-1 items-center px-4 sm:px-6 lg:pl-8 lg:pr-3">
          <div className="flex min-w-0 max-w-7xl flex-1 items-center gap-4 md:gap-6 lg:gap-8">
            <Link
              href={user ? '/dashboard' : '/signin'}
              className="max-w-[min(100%,14rem)] shrink-0 truncate text-base font-bold leading-tight text-[#2563EB] sm:max-w-[min(100%,18rem)] sm:text-lg md:max-w-none md:text-xl lg:text-2xl"
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
        </div>

        {/* Sessão: colada ao canto superior direito da barra (padding só na borda da viewport) */}
        <div className="flex h-full shrink-0 items-center gap-2 border-l border-slate-200/90 bg-slate-50/50 px-3 sm:gap-3 sm:px-4 md:px-5 lg:pr-8">
          {!loading && !user && (
            <Link
              href="/signin"
              className="shrink-0 cursor-pointer whitespace-nowrap rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:bg-blue-800"
            >
              Entrar
            </Link>
          )}
          {!loading && user && (
            <div className="flex min-w-0 max-w-[min(100vw-5.5rem,22rem)] items-center gap-3 sm:max-w-[min(100vw-6rem,28rem)] md:gap-4 lg:max-w-none">
              <div className="min-w-0 flex-1 text-right">
                <p
                  className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-[0.9375rem]"
                  title={user.email ?? undefined}
                >
                  {navUserLabel(user)}
                </p>
                {user.email ? (
                  <p
                    className="mt-0.5 hidden truncate text-xs font-normal text-slate-500 sm:block sm:max-w-[10rem] md:max-w-[14rem] lg:max-w-[18rem]"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/90 transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="cursor-pointer rounded-md p-2 text-slate-600 transition hover:bg-white/80 hover:text-[#2563EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 md:hidden"
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
