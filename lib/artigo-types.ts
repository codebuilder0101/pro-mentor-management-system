export type ArtigoTipo = 'depoimento' | 'artigo';

export type ArtigoRow = {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  nome_autor: string;
  cargo_autor: string;
  tipo: ArtigoTipo;
  publicado: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
};
