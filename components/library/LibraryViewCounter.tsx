'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

/** Registers one view via Supabase RPC (anon). Safe to fail silently. */
export default function LibraryViewCounter({ itemId }: { itemId: string }) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (cancelled) return;
        const supabase = createBrowserSupabaseClient();
        await supabase.rpc('increment_library_views', { item_id: itemId });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return null;
}
