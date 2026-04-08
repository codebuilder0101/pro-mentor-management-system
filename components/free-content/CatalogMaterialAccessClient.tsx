'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

type Kind = 'video' | 'document';

type Props = {
  kind: Kind;
  catalogId: string;
  materialName: string;
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm placeholder:text-gray-400 transition duration-200 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-500/12';

export default function CatalogMaterialAccessClient({ kind, catalogId, materialName }: Props) {
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setUrl(null);
    setLoading(true);
    try {
      const res = await fetch('/api/catalog/access-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          catalogKind: kind,
          catalogId,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || typeof data.url !== 'string') {
        setError(data.error ?? 'Não foi possível validar o acesso.');
        setLoading(false);
        return;
      }
      setUrl(data.url);
    } catch {
      setError('Falha de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3.5 text-sm text-blue-950">
        <p className="font-semibold text-blue-900 mb-1">Mesmo email do pagamento</p>
        <p>
          Utilize exatamente o email que indicou no checkout da Stripe para este material:{' '}
          <span className="font-medium">{materialName}</span>.
        </p>
      </div>

      {!url ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="access-email" className="mb-2 block text-sm font-semibold text-gray-900">
              Email
            </label>
            <input
              id="access-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@email.com"
              className={inputClass}
            />
          </div>
          {error ? (
            <div className="rounded-xl border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-900">{error}</div>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full sm:flex-1 justify-center" disabled={loading}>
              {loading ? 'A validar…' : 'Ver material'}
            </Button>
            <Button href="/free-content" variant="outline" size="lg" className="w-full sm:w-auto justify-center">
              Voltar à biblioteca
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ligação válida por tempo limitado. O ficheiro não fica com URL pública permanente na página.
          </p>
          {kind === 'video' ? (
            <video src={url} controls className="w-full rounded-xl border border-gray-200 bg-black shadow-lg" playsInline />
          ) : (
            <div className="space-y-3">
              <iframe
                src={url}
                title={materialName}
                className="w-full min-h-[70vh] rounded-xl border border-gray-200 bg-white shadow-inner"
              />
              <p className="text-sm text-gray-500">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] font-medium hover:underline">
                  Abrir noutra aba
                </a>
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setUrl(null)}>
              Trocar email
            </Button>
            <Link href="/free-content" className="inline-flex items-center justify-center text-sm font-semibold text-[#2563EB] hover:underline">
              ← Biblioteca
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
