import { redirect } from 'next/navigation';
import { safeInternalPath } from '@/lib/auth/safe-internal-path';

type Props = { searchParams: Promise<{ next?: string }> };

/** Compatibilidade: URLs antigas /login passam a usar /signin. */
export default async function LegacyLoginPage({ searchParams }: Props) {
  const { next: nextRaw } = await searchParams;
  const next = safeInternalPath(nextRaw);
  const qs = next === '/' ? '' : `?next=${encodeURIComponent(next)}`;
  redirect(`/signin${qs}`);
}
