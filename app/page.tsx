import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2563EB] to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg md:text-xl font-semibold text-blue-100 mb-3 tracking-wide uppercase">
              Adapte-se para Prosperar
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transforme sua Carreira com Método
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-2xl mx-auto">
            Domine a Metodologia Enxuta, Melhoria de Processos e Gestão de Pessoas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button href="/mentorship-program" size="lg" variant="secondary">
                Conhecer o programa
              </Button>
              <Button
                href="/free-content"
                size="lg"
                variant="outline"
                className="bg-white text-[#2563EB] hover:bg-gray-100"
              >
                Biblioteca de aprendizagem
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Por que escolher nossa proposta?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Jornada estruturada</h3>
                <p className="text-gray-600">
                  Mentoria em fases, com combinação de encontros individuais e em grupo, alinhada a
                  objetivos reais de carreira e de negócio.
                </p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Resultados na prática</h3>
                <p className="text-gray-600">
                  Foco em decisões, pessoas e processos — para evoluir liderança, adaptação e
                  desempenho organizacional.
                </p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Acompanhamento próximo</h3>
                <p className="text-gray-600">
                  Mentor com perfil acadêmico e de mercado: professor, mentor e palestrante, com
                  biblioteca e canais de apoio ao seu desenvolvimento.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Para quem é este programa?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Líderes e não líderes dentro das organizações: o convite é para quem precisa crescer com
            propósito, clareza e ferramentas — em qualquer papel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="text-4xl mb-3">👔</div>
              <h3 className="font-semibold text-gray-900">Líderes e gestores</h3>
              <p className="text-sm text-gray-600 mt-2">
                Que precisam alinhar pessoas, prioridades e resultados em ambientes complexos.
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-semibold text-gray-900">Líderes em formação</h3>
              <p className="text-sm text-gray-600 mt-2">
                Profissionais que assumem responsabilidade e querem desenvolver influência e gestão.
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="font-semibold text-gray-900">Especialistas técnicos</h3>
              <p className="text-sm text-gray-600 mt-2">
                Que desejam ampliar visão de negócio, comunicação e colaboração com outras áreas.
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="font-semibold text-gray-900">Profissionais em transição</h3>
              <p className="text-sm text-gray-600 mt-2">
                Mudança de carreira, função ou empresa — com diagnóstico e plano de próximos passos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core themes */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Temas centrais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="border-t-4 border-[#2563EB]">
              <h3 className="text-2xl font-bold mb-4 text-[#2563EB]">Liderança e adaptabilidade</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Postura de liderança em cenários incertos</li>
                <li>✓ Autoconhecimento e gestão da mudança</li>
                <li>✓ Comunicação assertiva e feedback</li>
              </ul>
            </Card>
            <Card hover className="border-t-4 border-green-600">
              <h3 className="text-2xl font-bold mb-4 text-green-600">Pessoas, decisão e estratégia</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Gestão de pessoas e equipes de alto desempenho</li>
                <li>✓ Pensamento estratégico e priorização</li>
                <li>✓ Tomada de decisão com dados e contexto</li>
              </ul>
            </Card>
            <Card hover className="border-t-4 border-purple-600">
              <h3 className="text-2xl font-bold mb-4 text-purple-600">Processos e organização</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Melhoria de processos e desempenho</li>
                <li>✓ Temas de excelência operacional (incluindo Lean como base de conhecimento)</li>
                <li>✓ Desenvolvimento organizacional alinhado à estratégia</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Palestras e Cursos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Palestras e cursos
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Além da mentoria, o cliente pode contratar formatos corporativos para escala e
            capacitação da equipe — com a mesma linha de autoridade: professor, mentor e
            palestrante.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card hover className="border-l-4 border-[#2563EB]">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Palestras</h3>
              <p className="text-gray-600">
                Palestras sob medida para eventos internos, convenções e encontros de liderança —
                com foco em cultura, performance, pessoas e transformação organizacional.
              </p>
            </Card>
            <Card hover className="border-l-4 border-green-600">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Cursos e treinamentos</h3>
              <p className="text-gray-600">
                Treinamentos em turma, workshops e trilhas temáticas para desenvolver competências
                de liderança, gestão e melhoria contínua no contexto da sua empresa.
              </p>
            </Card>
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Valores e formatos sob consulta — utilize a sessão de diagnóstico para alinhar necessidade
            e proposta.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2563EB] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para dar o próximo passo?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Agende uma conversa gratuita de entendimento dos seus objetivos e desafios — sem
            compromisso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/schedule-session" size="lg" variant="secondary">
              Agendar sessão de diagnóstico
            </Button>
            <Button
              href="/mentorship-program"
              size="lg"
              variant="outline"
              className="bg-white text-[#2563EB] hover:bg-gray-100"
            >
              Ver o programa de mentoria
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
