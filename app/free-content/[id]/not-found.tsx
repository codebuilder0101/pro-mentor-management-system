import Link from 'next/link';

export default function LibraryNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Material não encontrado</h1>
      <p className="text-gray-600 mb-6">Esse conteúdo não está disponível ou foi removido.</p>
      <Link href="/free-content" className="text-[#2563EB] font-semibold hover:underline">
        Voltar à biblioteca
      </Link>
    </div>
  );
}
