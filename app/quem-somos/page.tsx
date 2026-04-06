import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Quem somos · Mentoria Método C.O.M.A.V',
  description:
    'Propósito, missão, visão e valores do Programa de Mentoria Método C.O.M.A.V — adaptação, método e resultados com desenvolvimento humano.',
};

const values = [
  {
    title: 'Adaptabilidade',
    text: 'Capacidade de ajustar comportamentos e estratégias diante de diferentes contextos, transformando mudanças em oportunidades.',
  },
  {
    title: 'Método',
    text: 'Aplicação de caminhos estruturados, baseados em experiência prática e conhecimento científico.',
  },
  {
    title: 'Capricho',
    text: 'Compromisso com a excelência, atenção aos detalhes e qualidade nas entregas.',
  },
  {
    title: 'Resultados',
    text: 'Foco na geração de conquistas concretas e mensuráveis.',
  },
  {
    title: 'Harmonia',
    text: 'Buscar alinhamento entre propósito, relações e bem-estar na jornada profissional.',
  },
  {
    title: 'Transformação',
    text: 'Evolução contínua que gera mudanças positivas e duradouras.',
  },
] as const;

export default function QuemSomosPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#2563EB] to-blue-700 text-white py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
            Quem somos
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Propósito, missão, visão e valores que guiam nossa forma de desenvolver pessoas e
            organizações.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#2563EB] to-blue-600" aria-hidden />
            <div className="p-8 md:p-10">
              <h2 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider mb-3">
                Nosso propósito
              </h2>
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed text-justify">
                Contribuir para que as pessoas deixem de apenas reagir às circunstâncias e aprendam a
                se adaptar, tornando-se protagonista da própria transformação pessoal e profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border border-gray-100 h-full">
              <h2 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider mb-3">
                Missão
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed text-justify">
                Desenvolver profissionais adaptáveis, capazes de inspirar pessoas e gerar resultados
                sustentáveis.
              </p>
            </Card>
            <Card className="border border-gray-100 h-full">
              <h2 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider mb-3">
                Visão
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed text-justify">
                Ser referência na formação de profissionais que unem alta performance e desenvolvimento
                humano.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">VALORES</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
            O que sustenta nossas escolhas e a experiência de quem caminha conosco.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {values.map((item, index) => (
              <Card key={item.title} hover className="border border-gray-100 flex flex-col h-full">
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white text-sm font-bold"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm text-justify">{item.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-6">
            Quer conhecer a jornada prática do programa e os próximos passos?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/mentorship-program" size="lg" variant="primary">
              Ver programa de mentoria
            </Button>
            <Button href="/" size="lg" variant="outline">
              Voltar ao início
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
