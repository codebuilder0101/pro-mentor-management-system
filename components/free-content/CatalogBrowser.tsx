'use client';

import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export type CatalogListItem = {
  id: string;
  type: 'video' | 'ebook';
  title: string;
  metaLine: string;
  /** Preço formatado (BRL) ou «Gratuito». */
  priceLine: string;
  description: string;
  href: string;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((item) => (
            <Card key={`${item.type}-${item.id}`} hover>
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{getTypeIcon(item.type)}</span>
                <span className="text-xs bg-blue-100 text-[#2563EB] px-2 py-1 rounded">
                  {getTypeLabel(item.type)}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4 gap-2">
                <span>{item.metaLine}</span>
                <span
                  className={
                    item.priceLine === 'Gratuito' ? 'text-green-700 font-medium shrink-0' : 'text-amber-800 font-medium shrink-0'
                  }
                >
                  {item.priceLine}
                </span>
              </div>
              <Button variant="primary" className="w-full" href={item.href} target="_blank" rel="noopener noreferrer">
                Acessar material
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
