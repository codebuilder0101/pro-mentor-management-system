import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getCatalogDocumentById, getCatalogVideoById } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe-server';

export const runtime = 'nodejs';

const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function getPublicOrigin(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (env) return env;
  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'http';
  if (host) return `${proto}://${host}`;
  return 'http://localhost:3000';
}

function parseInstallments(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 1 && raw <= 12) {
    return raw;
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = parseInt(raw.trim(), 10);
    if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  }
  return null;
}

type Body = { catalogKind?: string; catalogId?: string; customerEmail?: string; installments?: unknown };

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const body = json as Body;
  const catalogKind = typeof body.catalogKind === 'string' ? body.catalogKind.trim() : '';
  const catalogId = typeof body.catalogId === 'string' ? body.catalogId.trim() : '';
  const customerEmail =
    typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
  const installments = parseInstallments(body.installments);

  if (catalogKind !== 'video' && catalogKind !== 'document') {
    return NextResponse.json({ ok: false, error: 'catalogKind inválido.' }, { status: 400 });
  }
  if (!catalogId) {
    return NextResponse.json({ ok: false, error: 'catalogId é obrigatório.' }, { status: 400 });
  }
  if (!customerEmail || !EMAIL.test(customerEmail)) {
    return NextResponse.json({ ok: false, error: 'Email inválido.' }, { status: 400 });
  }
  if (installments === null) {
    return NextResponse.json(
      { ok: false, error: 'Quantidade de parcelas inválida. Escolha de 1 a 12.' },
      { status: 400 }
    );
  }

  try {
    const row =
      catalogKind === 'video' ? await getCatalogVideoById(catalogId) : await getCatalogDocumentById(catalogId);

    if (!row) {
      return NextResponse.json({ ok: false, error: 'Material não encontrado.' }, { status: 404 });
    }
    if (row.price_cents <= 0) {
      return NextResponse.json({ ok: false, error: 'Este material é gratuito.' }, { status: 400 });
    }

    const origin = getPublicOrigin(request);
    const stripe = getStripe();

    const kindPt = catalogKind === 'video' ? 'vídeo' : 'documento';
    const accessDescription = `Acesso: ${kindPt} (visualização protegida) · Parcelamento no cartão: ${installments}x`;

    const baseParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: `${catalogKind}:${catalogId}:${customerEmail}`.slice(0, 140),
      metadata: {
        catalog_kind: catalogKind,
        catalog_id: catalogId,
        installments: String(installments),
      },
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: row.price_cents,
            product_data: {
              name: row.name.slice(0, 200),
              description: accessDescription.slice(0, 500),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/free-content/pagar/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/free-content/pagar/${catalogKind}/${catalogId}`,
    };

    const idemBase = `checkout_${catalogKind}_${catalogId}_${customerEmail}_i${installments}`.slice(0, 200);

    /** Tipagem do Checkout só expõe `enabled`; algumas regiões aceitam `plan` na API. */
    function installmentsOptsWithPlan(): NonNullable<Stripe.Checkout.SessionCreateParams['payment_method_options']> {
      return {
        card: {
          installments: {
            enabled: true,
            plan: {
              type: 'fixed_count',
              count: installments,
              interval: 'month',
            },
          } as Stripe.Checkout.SessionCreateParams.PaymentMethodOptions.Card.Installments,
        },
      };
    }

    function installmentsOptsEnabledOnly(): NonNullable<Stripe.Checkout.SessionCreateParams['payment_method_options']> {
      return {
        card: {
          installments: { enabled: true },
        },
      };
    }

    let session: Stripe.Response<Stripe.Checkout.Session>;

    if (installments > 1) {
      try {
        session = await stripe.checkout.sessions.create(
          {
            ...baseParams,
            payment_method_options: installmentsOptsWithPlan(),
          },
          { idempotencyKey: idemBase.slice(0, 255) }
        );
      } catch (e) {
        console.warn('[api/stripe/checkout] parcelamento com plano fixo rejeitado; a usar só enabled=true', e);
        session = await stripe.checkout.sessions.create(
          {
            ...baseParams,
            payment_method_options: installmentsOptsEnabledOnly(),
          },
          { idempotencyKey: `${idemBase}_fb`.slice(0, 255) }
        );
      }
    } else {
      session = await stripe.checkout.sessions.create(baseParams, { idempotencyKey: idemBase.slice(0, 255) });
    }

    if (!session.url) {
      return NextResponse.json({ ok: false, error: 'Sessão sem URL.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar checkout.';
    console.error('[api/stripe/checkout]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
