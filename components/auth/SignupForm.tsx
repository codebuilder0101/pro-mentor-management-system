'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { authMessages } from '@/lib/auth/auth-messages-pt';
import {
  isValidPasswordStrength,
  isValidEmailStructure,
  normalizeEmail,
} from '@/lib/auth/credentials';
import { useAuth } from '@/components/auth/AuthProvider';

const inputBase =
  'w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm placeholder:text-gray-400 transition duration-200 focus:outline-none focus:ring-4';

const inputNeutral = `${inputBase} border-gray-200 focus:border-[#2563EB] focus:ring-blue-500/12`;
const inputInvalid = `${inputBase} border-red-500 focus:border-red-600 focus:ring-red-500/15`;

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type Props = { redirectTo: string };

function getEmailFieldError(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return authMessages.emailRequired;
  if (!isValidEmailStructure(raw)) return authMessages.emailInvalid;
  return undefined;
}

export default function SignupForm({ redirectTo }: Props) {
  const router = useRouter();
  const { refresh } = useAuth();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!name.trim()) next.name = 'Informe seu nome completo.';
    const emailErr = getEmailFieldError(email);
    if (emailErr) next.email = emailErr;
    if (!password) {
      next.password = authMessages.passwordRequired;
    } else if (!isValidPasswordStrength(password)) {
      next.password = authMessages.passwordStrength;
    }
    if (password !== confirmPassword) {
      next.confirmPassword = authMessages.passwordMismatch;
    }
    setFieldErrors(next);
    setFormError(null);
    if (next.name) nameRef.current?.focus();
    else if (next.email) emailRef.current?.focus();
    else if (next.password) passwordRef.current?.focus();
    else if (next.confirmPassword) confirmRef.current?.focus();
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateForSubmit()) return;
    setFormError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizeEmail(email),
          password,
          confirmPassword,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        if (data.error === authMessages.emailTaken) {
          setFieldErrors((f) => ({ ...f, email: data.error as string }));
          emailRef.current?.focus();
        } else if (res.status === 400 && data.error === authMessages.emailRequired) {
          setFieldErrors((f) => ({ ...f, email: data.error }));
          emailRef.current?.focus();
        } else if (res.status === 400 && data.error === authMessages.emailInvalid) {
          setFieldErrors((f) => ({ ...f, email: data.error }));
          emailRef.current?.focus();
        } else if (res.status === 400 && data.error === authMessages.passwordRequired) {
          setFieldErrors((f) => ({ ...f, password: data.error }));
          passwordRef.current?.focus();
        } else if (res.status === 400 && data.error === authMessages.passwordStrength) {
          setFieldErrors((f) => ({ ...f, password: data.error }));
          passwordRef.current?.focus();
        } else if (res.status === 400 && data.error === authMessages.passwordMismatch) {
          setFieldErrors((f) => ({ ...f, confirmPassword: data.error }));
          confirmRef.current?.focus();
        } else {
          setFormError(typeof data.error === 'string' ? data.error : authMessages.generic);
        }
        setLoading(false);
        return;
      }
      await refresh();
      const nextParam = encodeURIComponent(redirectTo);
      router.push(`/signin?registered=1&next=${nextParam}`);
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
        <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-gray-900">
          Nome completo
        </label>
        <input
          ref={nameRef}
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setFieldErrors((f) => {
              if (!f.name) return f;
              const n = { ...f };
              if (e.target.value.trim()) delete n.name;
              return n;
            });
          }}
          className={fieldErrors.name ? inputInvalid : inputNeutral}
        />
        {fieldErrors.name ? (
          <p id="signup-name-error" className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-gray-900">
          Email
        </label>
        <input
          ref={emailRef}
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={onEmailBlur}
          className={fieldErrors.email ? inputInvalid : inputNeutral}
        />
        {fieldErrors.email ? (
          <p id="signup-email-error" className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-gray-900">
          Senha
        </label>
        <input
          ref={passwordRef}
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((f) => {
              if (!f.password) return f;
              const n = { ...f };
              if (!e.target.value) n.password = authMessages.passwordRequired;
              else if (!isValidPasswordStrength(e.target.value)) n.password = authMessages.passwordStrength;
              else delete n.password;
              return n;
            });
          }}
          className={fieldErrors.password ? inputInvalid : inputNeutral}
        />
        {fieldErrors.password ? (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="signup-confirm"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          Confirmar senha
        </label>
        <input
          ref={confirmRef}
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setFieldErrors((f) => {
              if (!f.confirmPassword) return f;
              const n = { ...f };
              if (password !== e.target.value) n.confirmPassword = authMessages.passwordMismatch;
              else delete n.confirmPassword;
              return n;
            });
          }}
          className={fieldErrors.confirmPassword ? inputInvalid : inputNeutral}
        />
        {fieldErrors.confirmPassword ? (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>
      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {formError}
        </div>
      ) : null}
      <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={loading}>
        {loading ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  );
}
