import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Adapte-se para Prosperar</h3>
            <p className="text-sm leading-relaxed">
              Mentoria e conteúdo para desenvolvimento organizacional: liderança, pessoas, decisão e
              crescimento profissional — com o Método C.O.M.A.V.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Links rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/quem-somos" className="hover:text-white transition-colors">
                  Quem somos
                </Link>
              </li>
              <li>
                <Link href="/free-content" className="hover:text-white transition-colors">
                  Biblioteca
                </Link>
              </li>
              <li>
                <Link href="/schedule-session" className="hover:text-white transition-colors">
                  Diagnóstico gratuito
                </Link>
              </li>
              <li>
                <Link href="/mentorship-program" className="hover:text-white transition-colors">
                  Programa de mentoria
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

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm space-y-3">
          <p className="text-gray-500 text-xs leading-relaxed max-w-2xl mx-auto">
            Método C.O.M.A.V., criado por Gustavo Máximo, com cocriação de Heber Gondim.
          </p>
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Adapte-se para Prosperar · Método C.O.M.A.V. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
