import type { LibraryItem } from '@/lib/library-types';

/** Itens antigos sem coluna: tratamos como gratuitos. */
export function isLibraryItemFree(item: LibraryItem): boolean {
  return item.is_free !== false;
}

/** Intro curto ou descrição como fallback. */
export function getLibraryIntro(item: LibraryItem): string {
  const i = item.intro?.trim();
  if (i) return i;
  return item.description?.trim() || '';
}
