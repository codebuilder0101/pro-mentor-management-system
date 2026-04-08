'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export type CatalogListItem = {
  id: string;
  type: 'video' | 'ebook';
  title: string;
  metaLine: string;
  priceCents: number;
  /** Preço formatado (BRL) ou «Gratuito». */
  priceLine: string;
  description: string;
  /** URL do material (apenas gratuito). Materiais pagos não expõem URL direta. */
  contentHref?: string;
  /** Rota interna para fluxo de pagamento (apenas pago). */
  payPath?: string;
};

type Filter = 'all' | 'video' | 'ebook';

type Props = {
  items: CatalogListItem[];
};

export default function CatalogBrowser({ items }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.type === filter);
  }, [items, filter]);

  const countVideo = useMemo(() => items.filter((i) => i.type === 'video').length, [items]);
  const countEbook = useMemo(() => items.filter((i) => i.type === 'ebook').length, [items]);

  const getTypeIcon = (type: CatalogListItem['type']) => (type === 'video' ? '🎥' : '📚');
  const getTypeLabel = (type: CatalogListItem['type']) =>
    type === 'video' ? 'Vídeo' : 'Livro / e-book';

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-8">
        <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>
          Todos ({items.length})
        </Button>
        <Button
          variant={filter === 'video' ? 'primary' : 'outline'}
          onClick={() => setFilter('video')}
        >
          Vídeos ({countVideo})
        </Button>
        <Button
          variant={filter === 'ebook' ? 'primary' : 'outline'}
          onClick={() => setFilter('ebook')}
        >
          Livros / e-books ({countEbook})
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12 mb-12">
          Nenhum material nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-stretch">
          {filtered.map((item) => {
            const isPaid = item.priceCents > 0;
            const cardBase = 'h-full flex flex-col !p-6 md:!p-7 relative overflow-hidden';
            const cardPaid =
              'border border-amber-100/90 shadow-lg shadow-amber-100/30 bg-gradient-to-b from-white to-amber-50/20';
            const cardFree = '';
            return (
              <Card
                key={`${item.type}-${item.id}`}
                hover={!isPaid}
                className={`${cardBase} ${isPaid ? cardPaid : cardFree}`}
              >
                {isPaid ? (
                  <div className="absolute right-0 top-0 z-10 rounded-bl-lg bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Premium
                  </div>
                ) : null}
                <div className="flex shrink-0 items-start justify-between gap-2 pr-14">
                  <span className="text-4xl opacity-90" aria-hidden>
                    {isPaid ? '🔒' : getTypeIcon(item.type)}
                  </span>
                  <span className="text-xs bg-blue-100 text-[#2563EB] px-2 py-1 rounded shrink-0">
                    {getTypeLabel(item.type)}
                  </span>
                </div>
                <h3 className="mt-3 shrink-0 text-xl font-semibold leading-snug text-gray-900 pr-2 line-clamp-2">
                  {item.title}
                </h3>
                <div className="mt-2 flex min-h-0 flex-1 flex-col">
                  <p className="line-clamp-4 text-sm leading-relaxed text-gray-600">{item.description}</p>
                </div>

                <div className="mt-4 shrink-0 border-t border-gray-100/80 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-2 text-sm text-gray-500">
                    <span className="truncate">{item.metaLine}</span>
                    <span
                      className={
                        item.priceLine === 'Gratuito'
                          ? 'shrink-0 font-semibold text-green-700'
                          : 'shrink-0 font-semibold tabular-nums text-amber-900'
                      }
                    >
                      {item.priceLine}
                    </span>
                  </div>
                  {isPaid && item.payPath ? (
                    <div className="space-y-2">
                      <p className="text-center text-xs font-medium text-amber-900/80 sm:text-left">
                        Acesso após pagamento confirmado · visualização protegida
                      </p>
                      <Link
                        href={item.payPath}
                        className="block w-full rounded-lg bg-[#2563EB] px-6 py-3.5 text-center text-base font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                      >
                        Pagar e acessar
                      </Link>
                      <Link
                        href={
                          item.type === 'video'
                            ? `/free-content/acesso/video/${item.id}`
                            : `/free-content/acesso/document/${item.id}`
                        }
                        className="block w-full rounded-lg border-2 border-amber-200 bg-white px-6 py-3 text-center text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                      >
                        Já paguei — acessar
                      </Link>
                    </div>
                  ) : item.contentHref ? (
                    <Button
                      variant="primary"
                      className="w-full py-3.5 text-base font-semibold shadow-md shadow-blue-600/15"
                      href={item.contentHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Acessar material
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
