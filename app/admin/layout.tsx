import { redirect } from 'next/navigation';
import { createSupabaseCookieClient } from '@/lib/supabase/ssr-server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=%2Fadmin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    redirect('/acesso-negado');
  }

  return <>{children}</>;
}
