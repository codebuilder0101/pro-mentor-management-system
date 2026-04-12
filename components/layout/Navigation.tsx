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
    if (base === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(base);
  };

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      await refresh();
      window.location.href = '/';
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold text-[#2563EB] leading-tight truncate">
              Programa de Mentoria Método C.O.M.A.V
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                      : 'text-gray-700 hover:text-[#2563EB]'
                  } px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {!loading && !user && (
              <Link
                href="/signin"
                className="text-sm font-semibold text-[#2563EB] hover:text-blue-800 whitespace-nowrap"
              >
                Entrar
              </Link>
            )}
            {!loading && user && (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                Sair
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {!loading && !user && (
              <Link href="/signin" className="text-sm font-semibold text-[#2563EB]">
                Entrar
              </Link>
            )}
            {!loading && user && (
              <button type="button" onClick={() => void handleLogout()} className="text-sm font-semibold text-gray-600">
                Sair
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[#2563EB] focus:outline-none p-1"
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
