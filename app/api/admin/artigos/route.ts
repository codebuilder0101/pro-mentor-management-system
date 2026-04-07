import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import type { ArtigoTipo } from '@/lib/artigo-types';

export const runtime = 'nodejs';

const TIPOS: ArtigoTipo[] = ['depoimento', 'artigo'];

function parseArtigoBody(body: unknown): {
  titulo: string;
  resumo: string;
  conteudo: string;
  nome_autor: string;
  cargo_autor: string;
  tipo: ArtigoTipo;
  publicado: boolean;
  ordem: number;
} | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const titulo = typeof o.titulo === 'string' ? o.titulo.trim() : '';
  const resumo = typeof o.resumo === 'string' ? o.resumo.trim() : '';
  const conteudo = typeof o.conteudo === 'string' ? o.conteudo.trim() : '';
  const nome_autor = typeof o.nome_autor === 'string' ? o.nome_autor.trim() : '';
  const cargo_autor = typeof o.cargo_autor === 'string' ? o.cargo_autor.trim() : '';
  let tipo: ArtigoTipo = 'depoimento';
  if (typeof o.tipo === 'string' && o.tipo.trim() !== '') {
    const tr = o.tipo.trim() as ArtigoTipo;
    if (!TIPOS.includes(tr)) return null;
    tipo = tr;
  }
  const publicado = o.publicado !== false;
  let ordem = 0;
  if (typeof o.ordem === 'number' && Number.isFinite(o.ordem)) {
    ordem = Math.floor(o.ordem);
  } else if (typeof o.ordem === 'string' && o.ordem.trim() !== '') {
    const n = parseInt(o.ordem.trim(), 10);
    if (Number.isFinite(n)) ordem = n;
  }
  if (!conteudo) return null;
  return { titulo, resumo, conteudo, nome_autor, cargo_autor, tipo, publicado, ordem };
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('artigos')
      .select('*')
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, artigos: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar artigos.';
    console.error('[api/admin/artigos GET]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }
  const parsed = parseArtigoBody(json);
  if (!parsed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Dados inválidos: o conteúdo é obrigatório.',
      },
      { status: 400 }
    );
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('artigos').insert(parsed).select('*').single();
    if (error) throw error;
    return NextResponse.json({ ok: true, item: data }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar artigo.';
    console.error('[api/admin/artigos POST]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
