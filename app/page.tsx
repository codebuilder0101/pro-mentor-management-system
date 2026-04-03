import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2563EB] to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transforme sua Carreira com Mentoria em Lean
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Domine a Metodologia Enxuta, Melhoria de Processos e Gestão de Pessoas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mentorship-program">
                <Button size="lg" variant="secondary">
                  Conhecer o Programa
                </Button>
              </Link>
              <Link href="/free-content">
                <Button size="lg" variant="outline" className="bg-white text-[#2563EB] hover:bg-gray-100">
                  Conteúdo Gratuito
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Por que escolher nosso programa?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Mentoria Personalizada</h3>
                <p className="text-gray-600">
                  Acompanhamento individual focado nas suas necessidades e objetivos profissionais específicos.
                </p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Resultados Comprovados</h3>
                <p className="text-gray-600">
                  Metodologias testadas e aprovadas que geram impacto real na sua carreira e organização.
                </p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Suporte Contínuo</h3>
                <p className="text-gray-600">
                  Acesso direto ao mentor e comunidade de profissionais para networking e troca de experiências.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Para quem é este programa?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="text-4xl mb-3">👔</div>
              <h3 className="font-semibold text-gray-900">Profissionais Empregados</h3>
              <p className="text-sm text-gray-600 mt-2">
                Que buscam se destacar e crescer em suas carreiras
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900">Gestores</h3>
              <p className="text-sm text-gray-600 mt-2">
                Que desejam melhorar processos e equipes
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900">Empreendedores</h3>
              <p className="text-sm text-gray-600 mt-2">
                Buscando otimizar operações e resultados
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900">Estudantes</h3>
              <p className="text-sm text-gray-600 mt-2">
                Preparando-se para o mercado de trabalho
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Topics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Áreas de Foco
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="border-t-4 border-[#2563EB]">
              <h3 className="text-2xl font-bold mb-4 text-[#2563EB]">Metodologia Enxuta</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Princípios fundamentais do Lean</li>
                <li>✓ Ferramentas práticas (5S, Kanban, VSM)</li>
                <li>✓ Eliminação de desperdícios</li>
                <li>✓ Melhoria contínua (Kaizen)</li>
              </ul>
            </Card>
            <Card hover className="border-t-4 border-green-600">
              <h3 className="text-2xl font-bold mb-4 text-green-600">Melhoria de Processos</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Mapeamento de processos</li>
                <li>✓ Análise de fluxo de valor</li>
                <li>✓ Otimização de operações</li>
                <li>✓ Métricas e indicadores</li>
              </ul>
            </Card>
            <Card hover className="border-t-4 border-purple-600">
              <h3 className="text-2xl font-bold mb-4 text-purple-600">Gestão de Pessoas</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Liderança e engajamento</li>
                <li>✓ Desenvolvimento de equipes</li>
                <li>✓ Cultura organizacional</li>
                <li>✓ Comunicação eficaz</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2563EB] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para dar o próximo passo?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Comece hoje mesmo sua jornada de transformação profissional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schedule-session">
              <Button size="lg" variant="secondary">
                Agendar Sessão Gratuita
              </Button>
            </Link>
            <Link href="/mentorship-program">
              <Button size="lg" variant="outline" className="bg-white text-[#2563EB] hover:bg-gray-100">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
