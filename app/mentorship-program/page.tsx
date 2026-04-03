'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function MentorshipProgramPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: '🎓',
      title: 'Mentoria Individual',
      description: 'Sessões 1:1 personalizadas focadas em seus objetivos específicos',
    },
    {
      icon: '📚',
      title: 'Material Exclusivo',
      description: 'Acesso a biblioteca completa de recursos, templates e ferramentas',
    },
    {
      icon: '🎥',
      title: 'Aulas ao Vivo',
      description: 'Workshops mensais e webinars sobre temas avançados em Lean',
    },
    {
      icon: '💬',
      title: 'Comunidade Privada',
      description: 'Grupo exclusivo para networking e troca de experiências',
    },
    {
      icon: '📊',
      title: 'Projetos Práticos',
      description: 'Aplique conceitos em projetos reais com feedback do mentor',
    },
    {
      icon: '📜',
      title: 'Certificado',
      description: 'Certificado de conclusão reconhecido ao final do programa',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Avaliação Inicial',
      description: 'Sessão de diagnóstico para entender seu contexto e definir objetivos',
    },
    {
      step: '2',
      title: 'Plano Personalizado',
      description: 'Criação de roadmap customizado baseado em suas necessidades',
    },
    {
      step: '3',
      title: 'Execução e Aprendizado',
      description: 'Sessões regulares, acesso a conteúdos e aplicação prática',
    },
    {
      step: '4',
      title: 'Resultados e Certificação',
      description: 'Avaliação de progresso e emissão de certificado',
    },
  ];

  const pricingTiers = [
    {
      name: 'Plano Trimestral',
      duration: '3 meses',
      price: 'R$ 999',
      period: '/mês',
      features: [
        '4 sessões individuais por mês',
        'Acesso à plataforma de conteúdos',
        'Comunidade privada',
        'Suporte por email',
        'Workshops mensais',
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
        '6 sessões individuais por mês',
        'Projetos práticos orientados',
        'Suporte prioritário',
        'Materiais exclusivos',
        'Certificado de conclusão',
      ],
      highlighted: true,
      badge: 'Mais Popular',
    },
  ];

  const faqs = [
    {
      question: 'Preciso ter conhecimento prévio em Lean?',
      answer:
        'Não é necessário! O programa é adaptado ao seu nível de conhecimento. Trabalhamos tanto com iniciantes quanto com profissionais que já têm experiência e querem se aprofundar.',
    },
    {
      question: 'Como funcionam as sessões de mentoria?',
      answer:
        'As sessões são realizadas por videoconferência em horários agendados previamente. Cada sessão dura aproximadamente 1 hora e é totalmente focada nos seus objetivos e desafios específicos.',
    },
    {
      question: 'Posso cancelar minha assinatura?',
      answer:
        'Sim, você pode cancelar a qualquer momento. Recomendamos completar pelo menos um ciclo trimestral para obter resultados significativos, mas não há multa por cancelamento.',
    },
    {
      question: 'O certificado é reconhecido?',
      answer:
        'Sim, ao concluir o programa você receberá um certificado digital que comprova sua participação e pode ser compartilhado no LinkedIn e em currículos.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2563EB] to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Programa de Mentoria em Lean
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Acelere sua transformação profissional com acompanhamento especializado em
            Metodologia Enxuta, Melhoria de Processos e Gestão de Pessoas
          </p>
          <Button href="/schedule-session" size="lg" variant="secondary">
            Agendar Sessão Gratuita
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            O que está incluído no programa?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Como funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Escolha seu plano
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Invista no seu desenvolvimento profissional com planos flexíveis
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative ${
                  tier.highlighted
                    ? 'border-2 border-[#2563EB] shadow-xl'
                    : 'border border-gray-200'
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
                  Começar Agora
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Perguntas Frequentes
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
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <span className="text-2xl text-[#2563EB]">
                      {activeFaq === index ? '−' : '+'}
                    </span>
                  </div>
                  {activeFaq === index && (
                    <p className="mt-4 text-gray-600">{faq.answer}</p>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#2563EB] to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua carreira?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Agende uma sessão gratuita e descubra como o programa pode ajudá-lo
          </p>
          <Button href="/schedule-session" size="lg" variant="secondary">
            Agendar Sessão Gratuita
          </Button>
        </div>
      </section>
    </div>
  );
}
