import { NextResponse } from 'next/server';
import { grantCatalogAccessFromSession } from '@/lib/stripe-checkout-grant';
import { getStripe } from '@/lib/stripe-server';

export const runtime = 'nodejs';

type Body = { sessionId?: string };

/**
 * Reforço quando o webhook ainda não correu ou falhou: confirma a sessão na Stripe
 * e grava o direito de acesso no Supabase (idempotente).
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const sessionId = typeof (json as Body).sessionId === 'string' ? (json as Body).sessionId!.trim() : '';
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ ok: false, error: 'sessionId inválido.' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const result = await grantCatalogAccessFromSession(session);
    if (!result.granted) {
      return NextResponse.json(
        { ok: false, error: result.reason ?? 'Não foi possível ativar o acesso.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao sincronizar com a Stripe.';
    console.error('[api/stripe/sync-checkout]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
