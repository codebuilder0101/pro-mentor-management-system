import { NextResponse } from 'next/server';
import { hasCatalogEntitlement } from '@/lib/catalog-entitlement-check';
import { createCatalogMaterialSignedUrl } from '@/lib/catalog-signed-url';
import { getCatalogDocumentById, getCatalogVideoById } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

type Body = { email?: string; catalogKind?: string; catalogId?: string };

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
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (catalogKind !== 'video' && catalogKind !== 'document') {
    return NextResponse.json({ ok: false, error: 'Tipo de material inválido.' }, { status: 400 });
  }
  if (!catalogId) {
    return NextResponse.json({ ok: false, error: 'Identificador do material em falta.' }, { status: 400 });
  }
  if (!email || !EMAIL.test(email)) {
    return NextResponse.json({ ok: false, error: 'Email inválido.' }, { status: 400 });
  }

  try {
    const row =
      catalogKind === 'video' ? await getCatalogVideoById(catalogId) : await getCatalogDocumentById(catalogId);

    if (!row) {
      return NextResponse.json({ ok: false, error: 'Material não encontrado.' }, { status: 404 });
    }

    if (row.price_cents <= 0) {
      const url = await createCatalogMaterialSignedUrl(catalogKind, row.filepath);
      return NextResponse.json({
        ok: true,
        url,
        name: row.name,
        kind: catalogKind,
        free: true,
      });
    }

    const entitled = await hasCatalogEntitlement(email, catalogKind, catalogId);
    if (!entitled) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Não encontrámos acesso para este email. Use o mesmo email do pagamento e aguarde alguns segundos após o Stripe confirmar, ou volte pela página de sucesso do checkout.',
        },
        { status: 403 }
      );
    }

    const url = await createCatalogMaterialSignedUrl(catalogKind, row.filepath);
    return NextResponse.json({
      ok: true,
      url,
      name: row.name,
      kind: catalogKind,
      free: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao preparar o acesso.';
    console.error('[api/catalog/access-url]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
