'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { authMessages } from '@/lib/auth/auth-messages-pt';
import { normalizeEmail, isValidEmailStructure } from '@/lib/auth/credentials';
import { useAuth } from '@/components/auth/AuthProvider';

const inputBase =
  'w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm placeholder:text-gray-400 transition duration-200 focus:outline-none focus:ring-4';

const inputNeutral = `${inputBase} border-gray-200 focus:border-[#2563EB] focus:ring-blue-500/12`;
const inputInvalid = `${inputBase} border-red-500 focus:border-red-600 focus:ring-red-500/15`;

type FieldErrors = {
  email?: string;
  password?: string;
};

type Props = { redirectTo: string };

function getEmailFieldError(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return authMessages.emailRequired;
  if (!isValidEmailStructure(raw)) return authMessages.emailInvalid;
  return undefined;
}

export default function LoginForm({ redirectTo }: Props) {
  const router = useRouter();
  const { refresh } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onEmailBlur() {
    const err = getEmailFieldError(email);
    setFieldErrors((f) => {
      const n = { ...f };
      if (err) n.email = err;
      else delete n.email;
      return n;
    });
  }

  function onEmailChange(value: string) {
    setEmail(value);
    setFieldErrors((f) => {
      if (!f.email) return f;
      const err = getEmailFieldError(value);
      const n = { ...f };
      if (err) n.email = err;
      else delete n.email;
      return n;
    });
  }

  function validateForSubmit(): boolean {
    const next: FieldErrors = {};
    const emailErr = getEmailFieldError(email);
    if (emailErr) next.email = emailErr;
    if (!password) next.password = authMessages.passwordRequired;
    setFieldErrors(next);
    setFormError(null);
    if (next.email) emailRef.current?.focus();
    else if (next.password) passwordRef.current?.focus();
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateForSubmit()) return;
    setFormError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizeEmail(email), password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        if (res.status === 400 && data.error === authMessages.emailRequired) {
          setFieldErrors((f) => ({ ...f, email: data.error }));
          emailRef.current?.focus();
        } else if (res.status === 400 && data.error === authMessages.emailInvalid) {
          setFieldErrors((f) => ({ ...f, email: data.error }));
          emailRef.current?.focus();
        } else if (res.status === 400 && data.error === authMessages.passwordRequired) {
          setFieldErrors((f) => ({ ...f, password: data.error }));
          passwordRef.current?.focus();
        } else {
          setFormError(data.error ?? authMessages.invalidCredentials);
        }
        setLoading(false);
        return;
      }
      await refresh();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setFormError(authMessages.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md mx-auto w-full" noValidate>
      <div>
        <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-gray-900">
          Email
        </label>
        <input
          ref={emailRef}
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={onEmailBlur}
          className={fieldErrors.email ? inputInvalid : inputNeutral}
        />
        {fieldErrors.email ? (
          <p id="login-email-error" className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-gray-900">
          Senha
        </label>
        <input
          ref={passwordRef}
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldErrors.password ? inputInvalid : inputNeutral}
        />
        {fieldErrors.password ? (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>
      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{formError}</div>
      ) : null}
      <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={loading}>
        {loading ? 'Entrando…' : 'Entrar'}
      </Button>
      <p className="text-center text-sm text-gray-600">
        <Link href={`/signup?next=${encodeURIComponent(redirectTo)}`} className="font-medium text-[#2563EB] hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
