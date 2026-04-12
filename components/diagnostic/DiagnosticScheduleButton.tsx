'use client';

import type { ComponentProps } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Button from '@/components/ui/Button';

/** `null` = ocultar (perfil admin). Caso contrário, URL para agendar ou iniciar sessão com retorno. */
export function useDiagnosticBookingHref(): string | null {
  const { role, user } = useAuth();
  if (role === 'admin') return null;
  if (user && role === 'user') return '/schedule-session';
  return '/signin?next=%2Fschedule-session';
}

type ButtonProps = ComponentProps<typeof Button>;

export function DiagnosticScheduleButton(props: Omit<ButtonProps, 'href'>) {
  const href = useDiagnosticBookingHref();
  if (!href) return null;
  return <Button {...props} href={href} />;
}
