'use client';

import React, { useEffect, useRef, useState } from 'react';
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

function userInitials(user: { email: string | null; name?: string | null }): string {
  const n = user.name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  const e = user.email?.trim();
  if (e) {
    const local = e.split('@')[0] ?? '';
    return local.slice(0, 2).toUpperCase();
  }
  return 'U';
}

function roleLabel(role: string | null): string {
  if (role === 'admin') return 'Administrador';
  return 'Mentorado';
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { loading, role, user, refresh } = useAuth();
  const diagnosticHref = useDiagnosticBookingHref();

  const solidNavPaths =
    /^\/(signin|signup|login)(\/|$)/.test(pathname) ||
    pathname.startsWith('/acesso-negado');
  const glassTop = !solidNavPaths && !scrolled;

  useEffect(() => {
    if (solidNavPaths) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solidNavPaths, pathname]);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

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
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
        glassTop
          ? 'border-b border-white/20 bg-[#2563EB]/88 shadow-none backdrop-blur-md supports-[backdrop-filter]:bg-[#2563EB]/80'
          : 'border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl min-w-0 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href={user ? '/dashboard' : '/signin'}
          className={`max-w-[min(100%,11rem)] shrink-0 truncate text-base font-bold leading-tight sm:max-w-[min(100%,16rem)] sm:text-lg md:max-w-[min(100%,20rem)] md:text-xl lg:max-w-none lg:text-2xl ${
            glassTop ? 'text-white drop-shadow-sm' : 'text-[#2563EB]'
          }`}
        >
          Programa de Mentoria Método C.O.M.A.V
        </Link>

        <div
          className={`hidden min-w-0 flex-1 items-center justify-center gap-x-1 md:flex lg:gap-x-2 ${
            navItems.length === 0 ? 'invisible pointer-events-none' : ''
          }`}
        >
          <div className="flex max-w-full items-center justify-center gap-x-5 lg:gap-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`whitespace-nowrap px-1 py-2 text-sm font-medium transition-colors ${
                  glassTop
                    ? isActive(item.path)
                      ? 'text-white'
                      : 'text-white/85 hover:text-white'
                    : isActive(item.path)
                      ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                      : 'text-slate-600 hover:text-[#2563EB]'
                } ${glassTop && isActive(item.path) ? 'border-b-2 border-white/90' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {!loading && !user && (
            <Link
              href="/signin"
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                glassTop
                  ? 'border-white/70 bg-white/10 text-white hover:bg-white/20'
                  : 'border-[#2563EB] bg-[#2563EB] text-white hover:bg-blue-700'
              }`}
            >
              Entrar
            </Link>
          )}
          {!loading && user && (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`group flex cursor-pointer items-center gap-2.5 rounded-full border px-2 py-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:px-3 ${
                  glassTop
                    ? 'border-white/30 bg-white/10 hover:bg-white/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    glassTop
                      ? 'bg-white/20 text-white'
                      : 'bg-[#2563EB]/10 text-[#2563EB]'
                  }`}
                >
                  {userInitials(user)}
                </span>
                <span className="hidden min-w-0 text-left sm:block">
                  <span
                    className={`block max-w-[8rem] truncate text-sm font-semibold leading-tight ${
                      glassTop ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {navUserLabel(user)}
                  </span>
                  <span
                    className={`block text-xs leading-tight ${
                      glassTop ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {roleLabel(role)}
                  </span>
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  } ${glassTop ? 'text-white/70' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {navUserLabel(user)}
                    </p>
                    {user.email && (
                      <p className="mt-0.5 truncate text-xs text-slate-500" title={user.email}>
                        {user.email}
                      </p>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); void handleLogout(); }}
                      className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`cursor-pointer rounded-full p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 md:hidden ${
              glassTop
                ? 'text-white hover:bg-white/15'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#2563EB]'
            }`}
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

      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t ${
            glassTop ? 'border-white/15 bg-slate-950/90 text-white backdrop-blur-lg' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base font-medium ${
                  glassTop
                    ? isActive(item.path)
                      ? 'bg-white/15 text-white'
                      : 'text-white/90 hover:bg-white/10'
                    : isActive(item.path)
                      ? 'bg-blue-50 text-[#2563EB]'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
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
