import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';
import ScheduleSessionClient from './ScheduleSessionClient';

export const dynamic = 'force-dynamic';

export default async function ScheduleSessionPage() {
  const supabase = await createSupabaseCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ScheduleSessionClient defaultEmail={user?.email?.trim() ?? ''} />;
}
