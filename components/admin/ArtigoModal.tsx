'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import type { ArtigoRow } from '@/lib/artigo-types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRow?: ArtigoRow | null;
};

const empty = {
  titulo: '',
  resumo: '',
  conteudo: '',
  nome_autor: '',
  cargo_autor: '',
  publicado: true,
  ordem: '0',
};

export default function ArtigoModal({ open, onClose, onSuccess, editRow = null }: Props) {
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = editRow !== null;

  const reset = useCallback(() => {
    setForm(empty);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editRow) {
      setForm({
        titulo: editRow.titulo,
        resumo: editRow.resumo,
        conteudo: editRow.conteudo,
        nome_autor: editRow.nome_autor,
        cargo_autor: editRow.cargo_autor,
        publicado: editRow.publicado,
        ordem: String(editRow.ordem),
      });
      setError(null);
      return;
    }
    reset();
  }, [open, editRow, reset]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const conteudo = form.conteudo.trim();
    if (!conteudo) {
      setError('O conteúdo é obrigatório.');
      return;
    }
    const ordem = parseInt(form.ordem.trim(), 10);
    const payload = {
      titulo: form.titulo.trim(),
      resumo: form.resumo.trim(),
      conteudo,
      nome_autor: form.nome_autor.trim(),
      cargo_autor: form.cargo_autor.trim(),
      publicado: form.publicado,
      ordem: Number.isFinite(ordem) ? ordem : 0,
      ...(isEdit ? {} : { tipo: 'depoimento' as const }),
    };
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/artigos/${editRow.id}` : '/api/admin/artigos';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Não foi possível salvar.');
        setSubmitting(false);
        return;
      }
      onSuccess();
      onClose();
      reset();
    } catch {
      setError('Falha de rede.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{isEdit ? 'Editar registro' : 'Novo registro'}</h3>
        <form onSubmit={submit} className="space-y-4">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-sm">{error}</div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
            <input
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Ex.: Destaque ou manchete curta"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumo / subtítulo (opcional)</label>
            <input
              value={form.resumo}
              onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Uma linha de contexto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
            <textarea
              value={form.conteudo}
              onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Texto principal (ex.: citação do depoimento ou corpo do artigo)"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do autor</label>
              <input
                value={form.nome_autor}
                onChange={(e) => setForm((f) => ({ ...f, nome_autor: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Ex.: Fernando A."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / função</label>
              <input
                value={form.cargo_autor}
                onChange={(e) => setForm((f) => ({ ...f, cargo_autor: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Ex.: Diretor industrial"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de exibição</label>
              <input
                type="number"
                value={form.ordem}
                onChange={(e) => setForm((f) => ({ ...f, ordem: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                min={0}
              />
              <p className="text-xs text-gray-500 mt-1">Menor número aparece primeiro.</p>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                id="artigo_publicado"
                type="checkbox"
                checked={form.publicado}
                onChange={(e) => setForm((f) => ({ ...f, publicado: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="artigo_publicado" className="text-sm font-medium text-gray-700">
                Publicado (visível no site)
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
