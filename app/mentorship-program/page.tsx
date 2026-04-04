'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function MentorshipProgramPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: '🎓',
      title: 'Mentoria individual',
      description:
        'Encontros 1:1 para aprofundar temas pessoais de liderança, carreira e desafios no trabalho.',
    },
    {
      icon: '👥',
      title: 'Mentoria em grupo',
      description:
        'Sessões coletivas para troca de experiências, alinhamento e aprendizado entre pares.',
    },
    {
      icon: '📚',
      title: 'Biblioteca e materiais',
      description:
        'Acesso a conteúdos, leituras, ferramentas e materiais estratégicos de apoio à jornada.',
    },
    {
      icon: '📊',
      title: 'Entregáveis orientados',
      description:
        'Exercícios, reflexões e planos de ação acompanhados ao longo das fases do programa.',
    },
    {
      icon: '💬',
      title: 'Canais de comunicação',
      description:
        'Combinamos encontros síncronos com apoio por canais combinados (conforme proposta fechada).',
    },
    {
      icon: '📜',
      title: 'Reconhecimento',
      description:
        'Certificado ou comprovação de participação ao concluir a jornada, conforme regras do programa.',
    },
  ];

  const phases = [
    {
      n: 1,
      title: 'Consciência, Diagnóstico e Direcionamento',
      sessions: 4,
      focus: 'Diagnóstico Inicial, Contrato de Jornada, Visão de Futuro e Diagnóstico Psicológico-Operacional, Direção - Âncoras de Carreira, Visualização Estratégica,  Base Pessoal - Valores, Energia, Crenças e Sacrifícios',
    },
    {
      n: 2,
      title: 'Autoliderança e Gestão Pessoal',
      sessions: 2,
      focus: 'Autogestão, Compromisso de Execução, Organização, Prioridade e Entrada no COMAV',
    },
    {
      n: 3,
      title: 'Liderança, Relações e Gestão de Pessoas, Direcionamento de Carreira e Posicionamento',
      sessions: 4,
      focus: 'Influência, Carisma, Conexões, Confiança, Reputação e Promoção Estratégica, Gestão de Pessoas, Performance, Carreira Y, Escolhas e Poder Profissional',
    },
    {
      n: 4,
      title: 'Execução, Alta Performance e Impacto',
      sessions: 3,
      focus: 'Estratégia, Informação, Resultado com Consciência,  Excelência, Capricho, Comunicação Executiva, Liderança Aplicada e Caráter',
    },
    {
      n: 5,
      title: 'Consolidação, Sustentabilidade e Entregáveis',
      sessions: 3,
      focus:
        'Inteligência Organizacional, Emoção sob Pressão, Planejamento Tático, Construção de Time, Encerramento, Consolidação e Certificação',
    }
  ];

  const expectedOutcomes = [
    'Maior clareza sobre prioridades de carreira e papel de liderança',
    'Ferramentas práticas para gestão de pessoas, comunicação e decisão',
    'Melhor capacidade de adaptação a mudanças organizacionais',
    'Visão mais estratégica sobre processos e resultados',
    'Plano de ação alinhado ao Método C.O.M.A.V e ao seu contexto',
  ];

  const pricingTiers = [
    {
      name: 'Plano Trimestral',
      duration: '3 meses',
      price: 'R$ 999',
      period: '/mês',
      features: [
        'Jornada estruturada em fases (referência: 16 sessões no programa completo)',
        'Combinação de sessões individuais e em grupo (conforme modalidade)',
        'Acesso à biblioteca de aprendizagem estratégica',
        'Materiais e apoio entre encontros',
      ],
      highlighted: false,
    },
    {
      name: 'Plano Semestral',
      duration: '6 meses',
      price: 'R$ 1.799',
      period: '/mês',
      originalPrice: 'R$ 999',
      features: [
        'Tudo do plano trimestral',
        'Maior profundidade na jornada e nos entregáveis',
        'Acompanhamento reforçado em projetos e decisões',
        'Prioridade em combinar datas e formatos de sessão',
        'Certificado / comprovação ao concluir (conforme regras)',
      ],
      highlighted: true,
      badge: 'Mais popular',
    },
  ];

  const faqs = [
    {
      question: 'O programa é só para quem já é líder?',
      answer:
        'Não, a jornada atende líderes, futuros líderes, especialistas e profissionais em transição. O foco é o desenvolvimento de competências de liderança, adaptação e gestão, em qualquer nível hierárquico.',
    },
    {
      question: 'Como funcionam as 16 sessões e as 5 fases?',
      answer:
        'A proposta organiza o percurso em seis fases temáticas, totalizando 16 encontros de mentoria, combinando modalidades individuais e em grupo conforme o que for definido na adesão. Os temas evoluem do diagnóstico até a consolidação, com um plano de ação.',
    },
    {
      question: 'O programa é focado em Lean?',
      answer:
        'Não, o centro é liderança, pessoas, decisão e desenvolvimento organizacional. Se fizer sentido para você, podemos passar por melhorias de processos e até usar o Lean como referência, mas isso é um apoio, não o carro-chefe da comunicação.',
    },
    {
      question: 'Posso cancelar minha assinatura?',
      answer:
        'Sim, as regras de cancelamento seguem o contrato ou proposta comercial fechada. Em geral, recomendamos completar um ciclo mínimo para perceber resultados consistentes.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#2563EB] to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold text-blue-100 mb-3 uppercase tracking-wide">
            Adapte-se para Prosperar
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Programa de Mentoria<br />Método C.O.M.A.V
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto text-justify">
            Nosso programa é estruturado em <strong className="text-white">5 fases</strong> e{' '}
            <strong className="text-white">16 encontros</strong>, realizados de forma individual ou em
            grupo, para desenvolver competências essenciais de liderança, gestão de pessoas, adaptação e
            leitura estratégica. Você aprenderá a lidar com contextos adversos e situações de pressão,
            fortalecendo sua capacidade de tomar decisões assertivas e conduzir equipes com confiança.
            Cada etapa foi pensada para ampliar sua visão organizacional e impulsionar sua carreira rumo a
            novos patamares.
          </p>
          <Button href="/schedule-session" size="lg" variant="secondary">
            Agendar sessão de diagnóstico gratuita
          </Button>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            O que está incluído
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Palestra ou treinamento para o time?
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Dá para contratar formatos corporativos à parte da mentoria individual. Conta o contexto na
            sessão de diagnóstico que a gente monta pauta e carga horária.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="flex flex-col border-l-4 border-[#2563EB]">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contratar palestra</h3>
              <p className="text-gray-600 text-sm mb-6 grow">
                Evento interno, kickoff, convenção. Uma palestra objetiva, alinhada ao tom da sua
                empresa.
              </p>
              <Button href="/schedule-session" variant="primary" className="w-full">
                Solicitar palestra
              </Button>
            </Card>
            <Card className="flex flex-col border-l-4 border-green-600">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contratar curso / treinamento</h3>
              <p className="text-gray-600 text-sm mb-6 grow">
                Turma fechada, workshop, trilha em módulos. Foco em competências de liderança e gestão.
              </p>
              <Button href="/schedule-session" variant="primary" className="w-full">
                Solicitar treinamento
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            A jornada em 5 fases
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Visão simplificada do percurso. A distribuição exata das 16 sessões entre fases e
            formatos (individual ou grupo) é alinhada na proposta de mentoria.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases.map((p) => (
              <Card key={p.n} hover className="border-t-4 border-[#2563EB]">
                <div className="text-sm font-semibold text-[#2563EB] mb-1">Fase {p.n}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{p.sessions} sessões nesta fase</p>
                <p className="text-gray-600 text-sm">{p.focus}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            Resultados esperados
          </h2>
          <Card>
            <ul className="space-y-3 text-gray-700">
              {expectedOutcomes.map((o, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Referência de investimento
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Valores ilustrativos para o MVP; confirme condições comerciais e entregáveis na proposta
            formal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative ${
                  tier.highlighted ? 'border-2 border-[#2563EB] shadow-xl' : 'border border-gray-200'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#2563EB] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600">{tier.duration}</p>
                  <div className="mt-4">
                    {tier.originalPrice && (
                      <span className="text-gray-400 line-through text-lg mr-2">
                        {tier.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  href="/schedule-session"
                  variant={tier.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  Falar sobre este plano
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <Card>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <span className="text-2xl text-[#2563EB] shrink-0">
                      {activeFaq === index ? '−' : '+'}
                    </span>
                  </div>
                  {activeFaq === index && (
                    <p className="mt-4 mx-4 mx-auto text-gray-600 text-justify">
                      {faq.answer}
                    </p>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#2563EB] to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para estruturar sua jornada?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Comece por uma sessão gratuita de entendimento e diagnóstico dos seus objetivos.
          </p>
          <Button href="/schedule-session" size="lg" variant="secondary">
            Agendar sessão de diagnóstico
          </Button>
        </div>
      </section>
    </div>
  );
}
