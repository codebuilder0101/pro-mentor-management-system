'use client';

import { useEffect, useState } from 'react';

type State = 'syncing' | 'ok' | 'err';

export default function CatalogPaySuccessSync({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<State | null>(sessionId ? 'syncing' : null);
  const [errDetail, setErrDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/stripe/sync-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const j = (await res.json()) as { ok?: boolean; error?: string };
        if (cancelled) return;
        if (res.ok && j.ok) {
          setState('ok');
        } else {
          setState('err');
          setErrDetail(j.error ?? 'Tente «Já paguei — acessar» na biblioteca com o mesmo email.');
        }
      } catch {
        if (!cancelled) {
          setState('err');
          setErrDetail('Verifique a ligação. O webhook pode ativar o acesso em breve.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (!sessionId || state === null) return null;
  if (state === 'syncing') {
    return <p className="mt-4 text-sm text-gray-600 text-left">A confirmar o pagamento no servidor…</p>;
  }
  if (state === 'ok') {
    return (
      <p className="mt-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-left">
        Acesso registado. Na biblioteca, abra este material e use <strong>Já paguei — acessar</strong> com o{' '}
        <strong>mesmo email</strong> utilizado no Stripe.
      </p>
    );
  }
  return (
    <p className="mt-4 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-left">
      {errDetail} Se o pagamento já foi concluído, aguarde alguns segundos e atualize esta página ou use o botão na
      biblioteca.
    </p>
  );
}
