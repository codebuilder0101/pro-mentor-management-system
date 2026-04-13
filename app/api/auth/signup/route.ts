import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { authMessages } from '@/lib/auth/auth-messages-pt';
import {
  normalizeEmail,
  isValidEmailStructure,
  isValidPasswordStrength,
} from '@/lib/auth/credentials';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type Body = { name?: string; email?: string; password?: string; confirmPassword?: string };

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 400 });
  }

  const body = json as Body;
  const fullName = typeof body.name === 'string' ? body.name.trim() : '';
  const emailRaw = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!fullName) {
    return NextResponse.json({ ok: false, error: 'Informe seu nome completo.' }, { status: 400 });
  }

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 503 });
  }

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

    const origin = new URL(request.url).origin;
    const emailRedirectTo = `${origin}/signin`;

    const authClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: signUpData, error: signUpErr } = await authClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { full_name: fullName },
      },
    });

    if (signUpErr) {
      const msg = signUpErr.message?.toLowerCase() ?? '';
      if (
        msg.includes('already') ||
        msg.includes('registered') ||
        msg.includes('exists') ||
        msg.includes('duplicate')
      ) {
        return NextResponse.json({ ok: false, error: authMessages.emailTaken }, { status: 409 });
      }
      console.error('[api/auth/signup] signUp', signUpErr);
      return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 400 });
    }

    const newUserId = signUpData.user?.id;
    if (newUserId) {
      const { error: profileErr } = await service
        .from('profiles')
        .update({ full_name: fullName, email })
        .eq('id', newUserId);
      if (profileErr) {
        console.warn('[api/auth/signup] profiles full_name sync', profileErr);
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('[api/auth/signup]', e);
    return NextResponse.json({ ok: false, error: authMessages.generic }, { status: 502 });
  }
}
