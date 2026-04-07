'use client';

import { FormEvent, useState } from 'react';
import Button from '@/components/ui/Button';

type Props = {
  catalogKind: 'video' | 'document';
  catalogId: string;
  amountLabel: string;
  materialName: string;
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm placeholder:text-gray-400 transition duration-200 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-500/12';

export default function CatalogPayCheckout({
  catalogKind,
  catalogId,
  amountLabel,
  materialName,
}: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogKind,
          catalogId,
          customerEmail: email.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || typeof data.url !== 'string') {
        setError(data.error ?? 'Não foi possível iniciar o pagamento.');
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Falha de rede. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-8 sm:px-8 space-y-6 text-[15px] text-gray-600 leading-relaxed">
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3.5 text-sm text-blue-950">
        <p className="font-semibold text-blue-900 mb-1">Pagamento seguro (Stripe)</p>
        <p>
          Introduza o email em que deseja receber o recibo. O acesso ao material só é ativado após a
          Stripe confirmar o pagamento (incluindo via webhook); não confiamos apenas no retorno do
          navegador.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="pay-email" className="mb-2 block text-sm font-semibold tracking-tight text-gray-900">
            Email para recibo e acesso
          </label>
          <input
            id="pay-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@email.com"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Deve coincidir com o email que usará para consultar o material ({materialName.slice(0, 60)}
            {materialName.length > 60 ? '…' : ''}).
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-900">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:flex-1 justify-center py-4 text-base font-semibold shadow-lg shadow-blue-600/25"
            disabled={loading}
          >
            {loading ? 'A redirecionar…' : `Pagar ${amountLabel} com cartão`}
          </Button>
          <Button href="/free-content" variant="outline" size="lg" className="w-full sm:w-auto justify-center">
            Voltar à biblioteca
          </Button>
        </div>
      </form>

      <ul className="space-y-2.5 text-sm text-gray-600">
        <li className="flex gap-2">
          <span className="font-bold text-emerald-600 shrink-0">✓</span>
          <span>Visualização apenas no leitor protegido (sem URL pública do ficheiro após compra).</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-emerald-600 shrink-0">✓</span>
          <span>Reembolsos tratados no servidor revogam o acesso.</span>
        </li>
      </ul>
    </div>
  );
}
