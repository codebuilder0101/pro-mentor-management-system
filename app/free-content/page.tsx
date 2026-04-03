'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type ContentType = 'all' | 'video' | 'ebook' | 'article' | 'tool' | 'guide';

interface ContentItem {
  id: number;
  title: string;
  type: 'video' | 'ebook' | 'article' | 'tool' | 'guide';
  duration?: string;
  pages?: number;
  views: number;
  description: string;
}

const contentData: ContentItem[] = [
  {
    id: 1,
    title: 'Liderança adaptativa em ambientes voláteis',
    type: 'video',
    duration: '22 min',
    views: 1243,
    description:
      'Como ajustar estilo de liderança e prioridades quando o contexto organizacional muda com frequência.',
  },
  {
    id: 2,
    title: 'Guia: conversas difíceis com equipes e pares',
    type: 'guide',
    pages: 14,
    views: 892,
    description:
      'Roteiro prático para preparar feedback, expectativas e acordos em situações sensíveis.',
  },
  {
    id: 3,
    title: 'E-book: pensamento estratégico para quem executa',
    type: 'ebook',
    pages: 48,
    views: 756,
    description:
      'Do operacional ao estratégico: priorização, alinhamento com metas e leitura de cenário.',
  },
  {
    id: 4,
    title: 'Artigo: decisões com dados e bom senso',
    type: 'article',
    pages: 8,
    views: 1087,
    description:
      'Como combinar indicadores, contexto e julgamento para decidir com mais clareza.',
  },
  {
    id: 5,
    title: 'Template: mapa de stakeholders e influência',
    type: 'tool',
    pages: 4,
    views: 654,
    description:
      'Ferramenta para mapear relações, interesses e canais de comunicação em projetos e mudanças.',
  },
  {
    id: 6,
    title: 'Gestão de tempo e foco para líderes',
    type: 'video',
    duration: '28 min',
    views: 923,
    description:
      'Agenda, energia e prioridades: reduzindo ruído e aumentando impacto na liderança.',
  },
  {
    id: 7,
    title: 'Melhoria de processos: onde o Lean entra na prática',
    type: 'article',
    pages: 10,
    views: 1156,
    description:
      'Visão introdutória da melhoria contínua e Lean como base de conhecimento — não como único foco.',
  },
  {
    id: 8,
    title: 'Checklist: onboarding e integração de talentos',
    type: 'tool',
    pages: 3,
    views: 534,
    description:
      'Lista para alinhar expectativas, cultura e primeiros resultados em novas contratações.',
  },
  {
    id: 9,
    title: 'Cultura de feedback e desenvolvimento contínuo',
    type: 'ebook',
    pages: 36,
    views: 678,
    description:
      'Estruturas simples para criar rituais de desenvolvimento sem burocratizar a gestão.',
  },
  {
    id: 10,
    title: 'Transição de carreira: diagnóstico e próximos passos',
    type: 'video',
    duration: '19 min',
    views: 812,
    description:
      'Para profissionais em mudança de função ou empresa: como organizar narrativa e plano de ação.',
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
      case 'article':
        return '📰';
      case 'tool':
        return '🧰';
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
        return 'Livro / e-book';
      case 'article':
        return 'Artigo';
      case 'tool':
        return 'Ferramenta';
      case 'guide':
        return 'Guia';
      default:
        return type;
    }
  };

  const countBy = (t: ContentType) =>
    t === 'all' ? contentData.length : contentData.filter((i) => i.type === t).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-100 font-semibold uppercase tracking-wide text-sm mb-2">
            Programa de Mentoria Método C.O.M.A.V
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Biblioteca de aprendizagem estratégica</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Um repositório curado de vídeos, artigos, livros e e-books, guias, ferramentas e
            materiais estratégicos — para apoiar sua evolução profissional e o desenvolvimento
            organizacional, além da mentoria.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 mb-8 max-w-3xl">
            Use os filtros para explorar formatos diferentes. Conteúdos complementares ampliam a base
            de conhecimento (incluindo temas de excelência operacional quando fizer sentido ao seu
            contexto).
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>
              Todos ({countBy('all')})
            </Button>
            <Button
              variant={filter === 'video' ? 'primary' : 'outline'}
              onClick={() => setFilter('video')}
            >
              Vídeos ({countBy('video')})
            </Button>
            <Button
              variant={filter === 'ebook' ? 'primary' : 'outline'}
              onClick={() => setFilter('ebook')}
            >
              Livros / e-books ({countBy('ebook')})
            </Button>
            <Button
              variant={filter === 'article' ? 'primary' : 'outline'}
              onClick={() => setFilter('article')}
            >
              Artigos ({countBy('article')})
            </Button>
            <Button
              variant={filter === 'tool' ? 'primary' : 'outline'}
              onClick={() => setFilter('tool')}
            >
              Ferramentas ({countBy('tool')})
            </Button>
            <Button
              variant={filter === 'guide' ? 'primary' : 'outline'}
              onClick={() => setFilter('guide')}
            >
              Guias ({countBy('guide')})
            </Button>
          </div>

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
                  <span>{item.duration || `${item.pages} pág.`}</span>
                  <span>{item.views} visualizações</span>
                </div>
                <Button variant="primary" className="w-full">
                  Acessar material
                </Button>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Quer ir além da biblioteca?</h2>
            <p className="text-lg mb-6 text-blue-100">
              A mentoria Método C.O.M.A.V combina jornada em fases, sessões individuais e em grupo e
              acompanhamento próximo — com entregáveis alinhados aos seus desafios.
            </p>
            <Button href="/mentorship-program" variant="secondary" size="lg">
              Conhecer o programa de mentoria
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
