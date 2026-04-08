import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/require-admin-api';
import type { ArtigoTipo } from '@/lib/artigo-types';

export const runtime = 'nodejs';

const TIPOS: ArtigoTipo[] = ['depoimento', 'artigo'];

function parseArtigoPatch(body: unknown): Partial<{
  titulo: string;
  resumo: string;
  conteudo: string;
  nome_autor: string;
  cargo_autor: string;
  tipo: ArtigoTipo;
  publicado: boolean;
  ordem: number;
}> | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (typeof o.titulo === 'string') out.titulo = o.titulo.trim();
  if (typeof o.resumo === 'string') out.resumo = o.resumo.trim();
  if ('conteudo' in o) {
    if (typeof o.conteudo !== 'string') return null;
    const c = o.conteudo.trim();
    if (!c) return null;
    out.conteudo = c;
  }
  if (typeof o.nome_autor === 'string') out.nome_autor = o.nome_autor.trim();
  if (typeof o.cargo_autor === 'string') out.cargo_autor = o.cargo_autor.trim();
  if (typeof o.tipo === 'string') {
    if (!TIPOS.includes(o.tipo.trim() as ArtigoTipo)) return null;
    out.tipo = o.tipo.trim() as ArtigoTipo;
  }
  if (typeof o.publicado === 'boolean') out.publicado = o.publicado;
  if (typeof o.ordem === 'number' && Number.isFinite(o.ordem)) {
    out.ordem = Math.floor(o.ordem);
  } else if (typeof o.ordem === 'string' && o.ordem.trim() !== '') {
    const n = parseInt(o.ordem.trim(), 10);
    if (Number.isFinite(n)) out.ordem = n;
  }
  return out as Partial<{
    titulo: string;
    resumo: string;
    conteudo: string;
    nome_autor: string;
    cargo_autor: string;
    tipo: ArtigoTipo;
    publicado: boolean;
    ordem: number;
  }>;
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }
  const parsed = parseArtigoPatch(json);
  if (!parsed || Object.keys(parsed).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nada para atualizar ou conteúdo vazio.' }, { status: 400 });
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('artigos').update(parsed).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Artigo não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar artigo.';
    console.error('[api/admin/artigos PATCH]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('artigos').delete().eq('id', id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Artigo não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao excluir artigo.';
    console.error('[api/admin/artigos DELETE]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
