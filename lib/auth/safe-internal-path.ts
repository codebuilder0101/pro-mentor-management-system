/** Evita open redirect: só caminhos relativos internos. */
export function safeInternalPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes(':')) {
    return '/';
  }
  return next;
}
