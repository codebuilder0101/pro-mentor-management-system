import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import {
  blockAccessByPaymentIntent,
  grantCatalogAccess,
  hasProcessedStripeEvent,
  insertProcessedStripeEvent,
  revokeAccessByPaymentIntent,
  type CatalogKind,
} from '@/lib/catalog-entitlements';
import { getStripe } from '@/lib/stripe-server';

export const runtime = 'nodejs';

function parseCatalogKind(s: string | undefined): CatalogKind | null {
  if (s === 'video' || s === 'document') return s;
  return null;
}

function paymentIntentIdFromSession(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (typeof pi === 'string') return pi;
  if (pi && typeof pi === 'object' && 'id' in pi) return pi.id;
  return null;
}

async function handlePaidCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== 'payment') return;

  const kind = parseCatalogKind(session.metadata?.catalog_kind);
  const catalogId = session.metadata?.catalog_id?.trim();
  if (!kind || !catalogId) {
    console.warn('[stripe webhook] sessão sem metadata de catálogo', session.id);
    return;
  }

  if (session.payment_status !== 'paid') return;

  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    console.warn('[stripe webhook] sessão sem email', session.id);
    return;
  }

  await grantCatalogAccess({
    email,
    catalogKind: kind,
    catalogId,
    checkoutSessionId: session.id,
    paymentIntentId: paymentIntentIdFromSession(session),
  });
}

async function dispatchStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      await handlePaidCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    }
    case 'checkout.session.async_payment_succeeded': {
      await handlePaidCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      await blockAccessByPaymentIntent(pi.id, 'failed');
      break;
    }
    case 'payment_intent.canceled': {
      const pi = event.data.object as Stripe.PaymentIntent;
      await blockAccessByPaymentIntent(pi.id, 'canceled');
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const piId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (piId) await revokeAccessByPaymentIntent(piId);
      break;
    }
    default:
      break;
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET não definido');
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Sem assinatura.' }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Assinatura inválida';
    console.warn('[stripe webhook] constructEvent:', msg);
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  try {
    if (await hasProcessedStripeEvent(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await dispatchStripeEvent(event);
    await insertProcessedStripeEvent(event.id);
  } catch (e) {
    console.error('[stripe webhook] handler', e);
    return NextResponse.json({ error: 'Falha ao processar.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
