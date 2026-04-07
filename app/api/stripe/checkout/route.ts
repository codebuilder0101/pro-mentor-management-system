import { NextResponse } from 'next/server';
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

type Body = { catalogKind?: string; catalogId?: string; customerEmail?: string };

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

  if (catalogKind !== 'video' && catalogKind !== 'document') {
    return NextResponse.json({ ok: false, error: 'catalogKind inválido.' }, { status: 400 });
  }
  if (!catalogId) {
    return NextResponse.json({ ok: false, error: 'catalogId é obrigatório.' }, { status: 400 });
  }
  if (!customerEmail || !EMAIL.test(customerEmail)) {
    return NextResponse.json({ ok: false, error: 'Email inválido.' }, { status: 400 });
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

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: customerEmail,
        client_reference_id: `${catalogKind}:${catalogId}:${customerEmail}`.slice(0, 140),
        metadata: {
          catalog_kind: catalogKind,
          catalog_id: catalogId,
        },
        line_items: [
          {
            price_data: {
              currency: 'brl',
              unit_amount: row.price_cents,
              product_data: {
                name: row.name.slice(0, 200),
                description: `Acesso: ${catalogKind === 'video' ? 'vídeo' : 'documento'} (visualização protegida)`,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/free-content/pagar/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/free-content/pagar/${catalogKind}/${catalogId}`,
      },
      { idempotencyKey: `checkout_${catalogKind}_${catalogId}_${customerEmail}`.slice(0, 255) }
    );

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
