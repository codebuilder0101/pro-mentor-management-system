/** Email: trim + lowercase for storage e comparação de unicidade. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Regras: não vazio após trim; sem espaços; exatamente um @;
 * parte local e domínio não vazias; domínio com pelo menos um '.'.
 */
export function isValidEmailStructure(raw: string): boolean {
  const s = raw.trim();
  if (s.length === 0) return false;
  if (/\s/.test(s)) return false;
  if ((s.match(/@/g) ?? []).length !== 1) return false;
  const [local, domain] = s.split('@');
  if (!local || !domain) return false;
  if (!domain.includes('.')) return false;
  return true;
}

export function isValidPasswordStrength(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
}
