import type Stripe from 'stripe';
import { grantCatalogAccess, type CatalogKind } from '@/lib/catalog-entitlements';

export function parseCatalogKind(s: string | undefined): CatalogKind | null {
  if (s === 'video' || s === 'document') return s;
  return null;
}

export function paymentIntentIdFromSession(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (typeof pi === 'string') return pi;
  if (pi && typeof pi === 'object' && 'id' in pi) return pi.id;
  return null;
}

/** Idempotente: pode ser chamado pelo webhook e pela página de sucesso. */
export async function grantCatalogAccessFromSession(
  session: Stripe.Checkout.Session
): Promise<{ granted: boolean; reason?: string }> {
  if (session.mode !== 'payment') {
    return { granted: false, reason: 'Modo de sessão inválido.' };
  }
  const kind = parseCatalogKind(session.metadata?.catalog_kind);
  const catalogId = session.metadata?.catalog_id?.trim();
  if (!kind || !catalogId) {
    return { granted: false, reason: 'Metadados do catálogo em falta na sessão.' };
  }
  if (session.payment_status !== 'paid') {
    return { granted: false, reason: 'Pagamento ainda não confirmado.' };
  }
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email?.trim()) {
    return { granted: false, reason: 'Email do cliente em falta na sessão.' };
  }

  await grantCatalogAccess({
    email,
    catalogKind: kind,
    catalogId,
    checkoutSessionId: session.id,
    paymentIntentId: paymentIntentIdFromSession(session),
  });
  return { granted: true };
}
