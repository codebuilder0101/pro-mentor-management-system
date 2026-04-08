import { NextResponse } from 'next/server';
import { getAdminDashboardPayload } from '@/lib/admin-dashboard-stats';
import { requireAdminApi } from '@/lib/auth/require-admin-api';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const payload = await getAdminDashboardPayload();
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao carregar painel.';
    console.error('[api/admin/dashboard]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
