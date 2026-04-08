import { NextResponse } from 'next/server';
import { authMessages } from '@/lib/auth/auth-messages-pt';
import { normalizeEmail, isValidEmailStructure } from '@/lib/auth/credentials';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';

export const runtime = 'nodejs';

type Body = { email?: string; password?: string };

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 400 });
  }

  const body = json as Body;
  const emailRaw = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!emailRaw.trim()) {
    return NextResponse.json({ ok: false, error: authMessages.emailRequired }, { status: 400 });
  }
  if (!isValidEmailStructure(emailRaw)) {
    return NextResponse.json({ ok: false, error: authMessages.emailInvalid }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ ok: false, error: authMessages.passwordRequired }, { status: 400 });
  }

  const email = normalizeEmail(emailRaw);

  try {
    const supabase = await createSupabaseCookieClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json(
        { ok: false, error: authMessages.invalidCredentials },
        { status: 401 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/auth/signin]', e);
    return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 502 });
  }
}
