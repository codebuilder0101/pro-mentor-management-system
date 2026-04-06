import { NextResponse } from 'next/server';

/** Validates x-admin-secret against LIBRARY_ADMIN_SECRET (server env). */
export function requireLibraryAdmin(request: Request): NextResponse | null {
  const configured = process.env.LIBRARY_ADMIN_SECRET?.trim();
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: 'LIBRARY_ADMIN_SECRET não configurado no servidor.' },
      { status: 503 }
    );
  }
  const sent = request.headers.get('x-admin-secret');
  if (sent !== configured) {
    return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 });
  }
  return null;
}
