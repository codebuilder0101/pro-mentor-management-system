import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { countUpcomingDiagnosticEvents } from '@/lib/calendar-service';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export type DashboardRecentItem = {
  id: string;
  label: string;
  relativeTime: string;
};

export type DashboardTopContent = {
  title: string;
  views: number;
  kind: string;
};

export type AdminDashboardPayload = {
  ok: true;
  metrics: {
    totalUsers: number | null;
    publishedContent: number;
    /** Futuros no Google Calendar (diagnóstico); null se a API não estiver disponível. */
    scheduledSessions: number | null;
    /** % de itens da biblioteca + mídia em estado publicado (entre publicado + rascunho). */
    completionRatePercent: number | null;
  };
  recentActivity: DashboardRecentItem[];
  topContent: DashboardTopContent[];
  warnings: string[];
};

const LIB_TYPE_LABEL: Record<string, string> = {
  video: 'Vídeo',
  ebook: 'E-book',
  article: 'Artigo',
  tool: 'Ferramenta',
  guide: 'Guia',
};

const MEDIA_TYPE_LABEL: Record<string, string> = {
  video: 'Vídeo',
  photo: 'Foto',
};

function headCount(res: { count: number | null; error: Error | null }): number {
  if (res.error) return 0;
  return res.count ?? 0;
}

async function countAuthUsers(): Promise<number | null> {
  try {
    const supabase = createServiceRoleClient();
    let total = 0;
    let page = 1;
    const perPage = 1000;
    for (;;) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) return null;
      total += data.users.length;
      if (data.users.length < perPage) break;
      page += 1;
    }
    return total;
  } catch {
    return null;
  }
}

async function countPublishedContentAggregate(): Promise<number> {
  const supabase = createServiceRoleClient();
  const [lib, vid, doc, med] = await Promise.all([
    supabase.from('library_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('videos').select('id', { count: 'exact', head: true }),
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('media_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ]);
  return headCount(lib) + headCount(vid) + headCount(doc) + headCount(med);
}

/** % de itens editorialmente “no ar”: biblioteca + media publicados vs rascunho. */
async function publicationCompletionPercent(): Promise<number | null> {
  const supabase = createServiceRoleClient();
  const [libPub, libDraft, medPub, medDraft] = await Promise.all([
    supabase.from('library_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('library_items').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('media_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('media_items').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);
  const pub = headCount(libPub) + headCount(medPub);
  const draft = headCount(libDraft) + headCount(medDraft);
  const total = pub + draft;
  if (total === 0) return null;
  return Math.round((pub / total) * 1000) / 10;
}

type ActivityRow = { id: string; label: string; at: string };

async function buildRecentActivity(limit: number): Promise<DashboardRecentItem[]> {
  const supabase = createServiceRoleClient();
  const [arts, libs, ents] = await Promise.all([
    supabase.from('artigos').select('id, titulo, conteudo, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('library_items').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(6),
    supabase
      .from('catalog_access_entitlements')
      .select('id, email_normalized, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const rows: ActivityRow[] = [];

  if (!arts.error && arts.data) {
    for (const a of arts.data) {
      const snippet = (a.titulo as string)?.trim() || String(a.conteudo ?? '').slice(0, 48);
      rows.push({
        id: `artigo-${a.id}`,
        label: snippet ? `Novo registro: ${snippet}${snippet.length >= 48 ? '…' : ''}` : 'Novo registro em Artigos',
        at: a.created_at as string,
      });
    }
  }

  if (!libs.error && libs.data) {
    for (const l of libs.data) {
      const st = l.status === 'published' ? 'publicado' : 'atualizado';
      rows.push({
        id: `lib-${l.id}`,
        label: `Biblioteca (${st}): ${l.title}`,
        at: l.created_at as string,
      });
    }
  }

  if (!ents.error && ents.data) {
    for (const e of ents.data) {
      rows.push({
        id: `ent-${e.id}`,
        label: `Acesso ao catálogo: ${e.email_normalized}`,
        at: e.created_at as string,
      });
    }
  }

  rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return rows.slice(0, limit).map((r) => ({
    id: r.id,
    label: r.label,
    relativeTime: formatDistanceToNow(new Date(r.at), { addSuffix: true, locale: ptBR }),
  }));
}

async function buildTopContent(limit: number): Promise<DashboardTopContent[]> {
  const supabase = createServiceRoleClient();
  const [libRes, medRes] = await Promise.all([
    supabase.from('library_items').select('title, views, type').eq('status', 'published').order('views', { ascending: false }).limit(12),
    supabase.from('media_items').select('name, views, type').eq('status', 'published').order('views', { ascending: false }).limit(12),
  ]);

  const merged: DashboardTopContent[] = [];
  if (!libRes.error && libRes.data) {
    for (const row of libRes.data) {
      merged.push({
        title: row.title as string,
        views: Number(row.views ?? 0),
        kind: LIB_TYPE_LABEL[String(row.type)] ?? 'Biblioteca',
      });
    }
  }
  if (!medRes.error && medRes.data) {
    for (const row of medRes.data) {
      merged.push({
        title: row.name as string,
        views: Number(row.views ?? 0),
        kind: MEDIA_TYPE_LABEL[String(row.type)] ?? 'Mídia',
      });
    }
  }
  merged.sort((a, b) => b.views - a.views);
  return merged.slice(0, limit);
}

export async function getAdminDashboardPayload(): Promise<AdminDashboardPayload> {
  const warnings: string[] = [];

  const [totalUsers, publishedContent, scheduledSessions, completionRatePercent, recentActivity, topContent] =
    await Promise.all([
      countAuthUsers(),
      countPublishedContentAggregate(),
      countUpcomingDiagnosticEvents(),
      publicationCompletionPercent(),
      buildRecentActivity(8),
      buildTopContent(8),
    ]);

  if (totalUsers === null) {
    warnings.push('Não foi possível contar usuários (Auth). Verifique a service role key.');
  }
  if (scheduledSessions === null) {
    warnings.push(
      'Sessões agendadas: Google Calendar indisponível ou não configurado; o valor não foi carregado.'
    );
  }

  return {
    ok: true,
    metrics: {
      totalUsers,
      publishedContent,
      scheduledSessions,
      completionRatePercent,
    },
    recentActivity,
    topContent,
    warnings,
  };
}
