'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type ContentType = 'all' | 'video' | 'ebook' | 'guide';

interface ContentItem {
  id: number;
  title: string;
  type: 'video' | 'ebook' | 'guide';
  duration?: string;
  pages?: number;
  views: number;
  description: string;
}

const contentData: ContentItem[] = [
  {
    id: 1,
    title: 'Introdução ao Lean Manufacturing',
    type: 'video',
    duration: '25 min',
    views: 1243,
    description: 'Aprenda os princípios básicos da metodologia Lean e como aplicá-los em sua organização.',
  },
  {
    id: 2,
    title: 'Guia Completo de 5S',
    type: 'ebook',
    pages: 45,
    views: 892,
    description: 'E-book detalhado sobre a implementação do método 5S para organização e eficiência.',
  },
  {
    id: 3,
    title: 'Mapeamento de Fluxo de Valor (VSM)',
    type: 'guide',
    pages: 12,
    views: 756,
    description: 'Guia prático para criar e analisar mapas de fluxo de valor em processos.',
  },
  {
    id: 4,
    title: 'Eliminando Desperdícios: Os 8 Tipos de Muda',
    type: 'video',
    duration: '18 min',
    views: 1087,
    description: 'Identifique e elimine os 8 tipos de desperdícios que reduzem a eficiência.',
  },
  {
    id: 5,
    title: 'Kanban para Gestão Visual',
    type: 'ebook',
    pages: 32,
    views: 654,
    description: 'Aprenda a implementar sistemas Kanban para controle visual de processos.',
  },
  {
    id: 6,
    title: 'Kaizen: Melhoria Contínua na Prática',
    type: 'guide',
    pages: 15,
    views: 923,
    description: 'Técnicas e ferramentas para implementar cultura de melhoria contínua.',
  },
  {
    id: 7,
    title: 'Gestão de Pessoas com Lean',
    type: 'video',
    duration: '32 min',
    views: 1156,
    description: 'Como aplicar princípios Lean na liderança e desenvolvimento de equipes.',
  },
  {
    id: 8,
    title: 'Métricas e KPIs em Processos Lean',
    type: 'ebook',
    pages: 28,
    views: 534,
    description: 'Defina e acompanhe indicadores-chave para medir sucesso em iniciativas Lean.',
  },
  {
    id: 9,
    title: 'Implementando Lean em Pequenas Empresas',
    type: 'guide',
    pages: 18,
    views: 678,
    description: 'Guia adaptado para implementação de Lean em organizações de pequeno porte.',
  },
];

export default function FreeContentPage() {
  const [filter, setFilter] = useState<ContentType>('all');

  const filteredContent =
    filter === 'all' ? contentData : contentData.filter((item) => item.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'ebook':
        return '📚';
      case 'guide':
        return '📄';
      default:
        return '📁';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Vídeo';
      case 'ebook':
        return 'E-book';
      case 'guide':
        return 'Guia';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Conteúdo Gratuito</h1>
          <p className="text-xl text-blue-100">
            Acesse vídeos, e-books e guias para começar sua jornada
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Todos ({contentData.length})
            </Button>
            <Button
              variant={filter === 'video' ? 'primary' : 'outline'}
              onClick={() => setFilter('video')}
            >
              🎥 Vídeos ({contentData.filter((i) => i.type === 'video').length})
            </Button>
            <Button
              variant={filter === 'ebook' ? 'primary' : 'outline'}
              onClick={() => setFilter('ebook')}
            >
              📚 E-books ({contentData.filter((i) => i.type === 'ebook').length})
            </Button>
            <Button
              variant={filter === 'guide' ? 'primary' : 'outline'}
              onClick={() => setFilter('guide')}
            >
              📄 Guias ({contentData.filter((i) => i.type === 'guide').length})
            </Button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredContent.map((item) => (
              <Card key={item.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{getTypeIcon(item.type)}</span>
                  <span className="text-xs bg-blue-100 text-[#2563EB] px-2 py-1 rounded">
                    {getTypeLabel(item.type)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{item.duration || `${item.pages} páginas`}</span>
                  <span>{item.views} visualizações</span>
                </div>
                <Button variant="primary" className="w-full">
                  Acessar
                </Button>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Quer ir além do conteúdo gratuito?
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              Junte-se ao nosso programa de mentoria e tenha acesso a acompanhamento
              personalizado, sessões ao vivo e muito mais.
            </p>
            <Button href="/mentorship-program" variant="secondary" size="lg">
              Conhecer o Programa de Mentoria
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
