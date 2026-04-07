/** Formata duração em segundos para exibição (ex.: biblioteca). */
export function formatDurationSeconds(total: number): string {
  if (!Number.isFinite(total) || total < 0) return '—';
  if (total < 60) return `${Math.floor(total)} s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) return s ? `${m} min ${s} s` : `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h} h ${rm} min` : `${h} h`;
}
