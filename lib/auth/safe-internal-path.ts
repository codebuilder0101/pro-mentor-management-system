/** Caminho após login quando `next` é omitido ou inválido. */
export const DEFAULT_POST_AUTH_PATH = '/dashboard';

/** Evita open redirect: só caminhos relativos internos. */
export function safeInternalPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes(':')) {
    return DEFAULT_POST_AUTH_PATH;
  }
  if (next === '/') {
    return DEFAULT_POST_AUTH_PATH;
  }
  return next;
}
