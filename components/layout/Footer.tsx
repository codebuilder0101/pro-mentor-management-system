import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Programa de Mentoria Método C.O.M.A.V</h3>
            <p className="text-sm">
              Transformando profissionais através da Metodologia Enxuta,
              Melhoria de Processos e Gestão de Pessoas.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/free-content" className="hover:text-white transition-colors">
                  Conteúdo Gratuito
                </Link>
              </li>
              <li>
                <Link href="/schedule-session" className="hover:text-white transition-colors">
                  Agendar Sessão
                </Link>
              </li>
              <li>
                <Link href="/mentorship-program" className="hover:text-white transition-colors">
                  Programa de Mentoria
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: contato@leanmentor.com.br</li>
              <li>Telefone: (11) 9999-9999</li>
              <li>LinkedIn: /leanmentor</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Programa de Mentoria Método C.O.M.A.V. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
