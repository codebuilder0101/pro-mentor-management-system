import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { fetchPublishedDepoimentos } from '@/lib/supabase/server';

/* Foto: coloque o arquivo em public/ (ex.: gustavoimage.jpg) e use src="/gustavoimage.jpg" — nunca use o prefixo /public/ na URL. */

export const dynamic = 'force-dynamic';

export default async function Home() {
  let depoimentos: Awaited<ReturnType<typeof fetchPublishedDepoimentos>> = [];
  try {
    depoimentos = await fetchPublishedDepoimentos();
  } catch {
    depoimentos = [];
  }
  return (
    <div className="min-h-screen">
      {/* Hero: foto em public/gustavoimage.jpg → URL é /gustavoimage.jpg */}
      <section className="bg-gradient-to-br from-[#2563EB] to-blue-700 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
              <p className="text-sm font-semibold text-blue-100 mb-4 tracking-wide uppercase">
                Adapte-se para Prosperar
              </p>
              <div className="flex justify-center lg:justify-start mb-6">
                <Image
                  src="/logo-metodo-comav.svg"
                  alt="Método C.O.M.A.V"
                  width={260}
                  height={48}
                  className="h-10 w-auto opacity-95"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
                Mentoria e aprendizado para quem leva gente e resultado a sério
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-3 max-w-xl mx-auto lg:mx-0 text-justify">
                Liderança, gestão de pessoas, desenvolvimento profissional, adaptação e visão
                estratégica, dentro da empresa ou na sua carreira. Para quem manda e para quem ainda
                não manda, mas precisa influenciar e crescer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button href="/mentorship-program" size="lg" variant="secondary">
                  Ver programa de mentoria
                </Button>
                <Button
                  href="/free-content"
                  size="lg"
                  variant="outline"
                  className="bg-white text-[#2563EB] hover:bg-gray-100"
                >
                  Acessar a biblioteca
                </Button>
              </div>
            </div>
            <div className="shrink-0 order-1 lg:order-2">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-full overflow-hidden ring-4 ring-white/35 shadow-2xl bg-white/10">
                <Image
                  src="/image.png"
                  alt="Gustavo Máximo, mentor"
                  width={320}
                  height={320}
                  className="h-full w-full object-cover object-[52%_24%] sm:object-[51%_22%]"
                  priority
                />
              </div>
              <p className="text-center text-blue-100 mt-4 font-semibold">Gustavo Máximo</p>
              <p className="text-center text-blue-200/90 text-sm">
              Liderança Situacional · Gestão Estratégica · Pessoas · Método · Resultados
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre o mentor</h2>
          <p className="text-gray-600 leading-relaxed mb-3 text-justify">
            Gustavo Máximo conduz a mentoria com pé no chão: combina formação acadêmica com experiência
            de mercado. O foco não é “empilhar conceitos”, é você sair dos encontros com clareza para
            decidir melhor, conversar melhor com pessoas e fazer a organização andar.
          </p>
          <p className="text-gray-600 leading-relaxed text-justify">
            O fio condutor é o <strong className="text-gray-800">Método C.O.M.A.V</strong>, uma jornada
            pensada para desenvolvimento humano e resultados, sem reduzir tudo a um único slogan de
            moda.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            O que você encontra por aqui
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Trilha com lógica</h3>
                <p className="text-gray-600">
                  Encontros em fases, misturando individual e grupo quando faz sentido. Você sabe onde
                  está na jornada e o que vem depois.
                </p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Pra usar segunda-feira</h3>
                <p className="text-gray-600">
                  Prioridade em decisão, conversa difícil, time desalinhado, meta mal explicada — o
                  tipo de coisa que aparece no trabalho real, não só no slide.
                </p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Mão na massa com apoio</h3>
                <p className="text-gray-600">
                  Material de apoio, leituras e ferramentas na biblioteca. Você não fica sozinho entre
                  um encontro e outro.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Fez sentido para você?</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Vale tanto para quem já está na cadeira de liderança quanto para quem está construindo
            autoridade sem cargo formal ainda.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="text-4xl mb-3">👔</div>
              <h3 className="font-semibold text-gray-900">Líderes e gestores</h3>
              <p className="text-sm text-gray-600 mt-2">
                Precisa alinhar time, cobrar resultado e ainda manter clima minimamente saudável.
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-semibold text-gray-900">Quem está virando referência</h3>
              <p className="text-sm text-gray-600 mt-2">
                Ainda sem “cargo de chefe”, mas já puxa projeto, orienta colega e sente o peso.
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="font-semibold text-gray-900">Especialistas</h3>
              <p className="text-sm text-gray-600 mt-2">
                Domina o técnico e quer falar a língua do negócio sem parecer isolado.
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="font-semibold text-gray-900">Em transição</h3>
              <p className="text-sm text-gray-600 mt-2">
                Mudou de função, empresa ou carreira e precisa reorganizar narrativa e prioridades.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">No que a gente mergulha</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="border-t-4 border-[#2563EB]">
              <h3 className="text-xl font-bold mb-4 text-[#2563EB]">Liderança e adaptação</h3>
              <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
                <li>• Postura quando o cenário muda toda hora</li>
                <li>• Autoconhecimento sem Autoajulo vazio</li>
                <li>• Feedback e conversa que não vira briga</li>
              </ul>
            </Card>
            <Card hover className="border-t-4 border-green-600">
              <h3 className="text-xl font-bold mb-4 text-green-600">Pessoas, decisão e estratégia</h3>
              <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
                <li>• Time desmotivado vs. meta agressiva — onde cortar o nó</li>
                <li>• Prioridade: o que fica, o que sai da mesa</li>
                <li>• Decisão com informação incompleta (que é o normal)</li>
              </ul>
            </Card>
            <Card hover className="border-t-4 border-purple-600">
              <h3 className="text-xl font-bold mb-4 text-purple-600">Organização e processo</h3>
              <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
                <li>• Processo travando resultado</li>
                <li>• Melhoria contínua — às vezes entra Lean como referência, entre outras</li>
                <li>• Alinhar operação com o que a empresa diz que é estratégico</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Palestras e treinamento in company
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Precisa levar a mesma linha para muita gente de uma vez? Dá para contratar palestra ou
            curso fechado para o seu time. A gente desenha pauta e duração junto com você.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card hover className="border-l-4 border-[#2563EB] flex flex-col">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Contratar palestra</h3>
              <p className="text-gray-600 mb-6 grow">
                Evento interno, convenção, encontro de liderança. Uma palestra bem montada vira
                conversa — não auditório adormecido.
              </p>
              <Button href="/schedule-session" size="md" variant="primary" className="w-full">
                Pedir orçamento de palestra
              </Button>
            </Card>
            <Card hover className="border-l-4 border-green-600 flex flex-col">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Contratar curso / treinamento</h3>
              <p className="text-gray-600 mb-6 grow">
                Workshop, trilha em turma, imersão. Foco em competências de liderança, gestão e
                desenvolvimento — no ritmo da sua empresa.
              </p>
              <Button href="/schedule-session" size="md" variant="primary" className="w-full">
                Pedir proposta de treinamento
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {depoimentos.length > 0 ? (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Depoimentos</h2>
            <p className="text-center text-gray-600 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
              Resultados de quem já vivenciou a mentoria
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {depoimentos.map((d) => (
                <Card
                  key={d.id}
                  className="flex flex-col h-full border border-gray-100 bg-white shadow-md rounded-xl"
                >
                  <p className="text-gray-700 leading-relaxed mb-6 grow text-[15px] md:text-base text-justify">
                    &ldquo;{d.conteudo}&rdquo;
                  </p>
                  <div className="mt-auto pt-2 space-y-0.5">
                    {d.nome_autor ? (
                      <p className="font-semibold text-gray-900 tracking-tight">{d.nome_autor}</p>
                    ) : null}
                    {d.cargo_autor ? (
                      <p className="text-sm text-gray-500 leading-snug">{d.cargo_autor}</p>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16 bg-[#2563EB] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Quer conversar sem compromisso?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Marca uma sessão gratuita de diagnóstico: a gente ouve seu contexto, tira dúvidas e vê se
            a mentoria (ou outro formato) encaixa.
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
              Ver detalhes do programa
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
