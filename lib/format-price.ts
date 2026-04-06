/** Formata centavos em BRL (ex.: 4990 → R$ 49,90). */
export function formatPriceBRL(priceCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100);
}

/** Aceita "49,90" ou "49.90" → centavos. */
export function parseReaisToCents(input: string): number | null {
  const t = input.trim().replace(/\s/g, '');
  if (!t) return null;
  const normalized = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  const n = parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function centsToReaisField(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents) || cents <= 0) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}
