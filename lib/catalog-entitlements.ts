import { createServiceRoleClient } from '@/lib/supabase/admin';

export type CatalogKind = 'video' | 'document';

type GrantParams = {
  email: string;
  catalogKind: CatalogKind;
  catalogId: string;
  checkoutSessionId: string;
  paymentIntentId: string | null;
};

export async function hasProcessedStripeEvent(eventId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('stripe_processed_events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();
  if (error) throw error;
  return data != null;
}

export async function insertProcessedStripeEvent(eventId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('stripe_processed_events').insert({ id: eventId });
  if (error?.code === '23505') return;
  if (error) throw error;
}

export async function grantCatalogAccess(params: GrantParams): Promise<void> {
  const supabase = createServiceRoleClient();
  const emailNormalized = params.email.trim().toLowerCase();
  const { error } = await supabase.from('catalog_access_entitlements').upsert(
    {
      email_normalized: emailNormalized,
      catalog_kind: params.catalogKind,
      catalog_id: params.catalogId,
      stripe_checkout_session_id: params.checkoutSessionId,
      stripe_payment_intent_id: params.paymentIntentId,
      payment_status: 'paid',
      access_granted: true,
    },
    { onConflict: 'email_normalized,catalog_kind,catalog_id' }
  );
  if (error) throw error;
}

export async function revokeAccessByPaymentIntent(paymentIntentId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('catalog_access_entitlements')
    .update({
      access_granted: false,
      payment_status: 'refunded',
    })
    .eq('stripe_payment_intent_id', paymentIntentId);
  if (error) throw error;
}

export async function blockAccessByPaymentIntent(
  paymentIntentId: string,
  status: 'failed' | 'canceled'
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('catalog_access_entitlements')
    .update({
      access_granted: false,
      payment_status: status,
    })
    .eq('stripe_payment_intent_id', paymentIntentId);
  if (error) throw error;
}
