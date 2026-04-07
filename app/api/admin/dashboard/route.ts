import { NextResponse } from 'next/server';
import { getAdminDashboardPayload } from '@/lib/admin-dashboard-stats';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const payload = await getAdminDashboardPayload();
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao carregar painel.';
    console.error('[api/admin/dashboard]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
