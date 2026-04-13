import { redirect } from 'next/navigation';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';

export const dynamic = 'force-dynamic';

export default async function ScheduleSessionLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?next=%2Fschedule-session');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'user') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
