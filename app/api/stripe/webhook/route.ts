import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import {
  blockAccessByPaymentIntent,
  hasProcessedStripeEvent,
  insertProcessedStripeEvent,
  revokeAccessByPaymentIntent,
} from '@/lib/catalog-entitlements';
import { grantCatalogAccessFromSession } from '@/lib/stripe-checkout-grant';
import { getStripe } from '@/lib/stripe-server';

export const runtime = 'nodejs';

async function handlePaidCheckoutSession(session: Stripe.Checkout.Session) {
  const result = await grantCatalogAccessFromSession(session);
  if (!result.granted && result.reason === 'Metadados do catálogo em falta na sessão.') {
    console.warn('[stripe webhook] sessão sem metadata de catálogo', session.id);
  }
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
