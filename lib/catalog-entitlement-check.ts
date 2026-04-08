import { createServiceRoleClient } from '@/lib/supabase/admin';
import type { CatalogKind } from '@/lib/catalog-entitlements';

export async function hasCatalogEntitlement(
  email: string,
  catalogKind: CatalogKind,
  catalogId: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('catalog_access_entitlements')
    .select('access_granted')
    .eq('email_normalized', normalized)
    .eq('catalog_kind', catalogKind)
    .eq('catalog_id', catalogId)
    .maybeSingle();

  if (error || !data) return false;
  return data.access_granted === true;
}
