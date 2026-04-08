import { NextResponse } from 'next/server';
import { authMessages } from '@/lib/auth/auth-messages-pt';
import {
  normalizeEmail,
  isValidEmailStructure,
  isValidPasswordStrength,
} from '@/lib/auth/credentials';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';

export const runtime = 'nodejs';

type Body = { email?: string; password?: string; confirmPassword?: string };

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
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!emailRaw.trim()) {
    return NextResponse.json({ ok: false, error: authMessages.emailRequired }, { status: 400 });
  }
  if (!isValidEmailStructure(emailRaw)) {
    return NextResponse.json({ ok: false, error: authMessages.emailInvalid }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ ok: false, error: authMessages.passwordRequired }, { status: 400 });
  }
  if (!isValidPasswordStrength(password)) {
    return NextResponse.json({ ok: false, error: authMessages.passwordStrength }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ ok: false, error: authMessages.passwordMismatch }, { status: 400 });
  }

  const email = normalizeEmail(emailRaw);

  try {
    const service = createServiceRoleClient();

    const { data: alreadyRegistered, error: rpcErr } = await service.rpc('email_registered', {
      check_email: email,
    });
    if (rpcErr) {
      console.warn('[api/auth/signup] email_registered rpc', rpcErr);
    } else if (alreadyRegistered === true) {
      return NextResponse.json({ ok: false, error: authMessages.emailTaken }, { status: 409 });
    }

    const { error: createErr } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createErr) {
      const msg = createErr.message?.toLowerCase() ?? '';
      if (
        msg.includes('already') ||
        msg.includes('registered') ||
        msg.includes('exists') ||
        msg.includes('duplicate')
      ) {
        return NextResponse.json({ ok: false, error: authMessages.emailTaken }, { status: 409 });
      }
      console.error('[api/auth/signup] createUser', createErr);
      return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 400 });
    }

    const supabase = await createSupabaseCookieClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr) {
      console.error('[api/auth/signup] signIn after create', signErr);
      return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('[api/auth/signup]', e);
    return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 502 });
  }
}
