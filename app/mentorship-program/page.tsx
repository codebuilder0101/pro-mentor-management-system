import MentorshipProgramClient from './MentorshipProgramClient';
import { fetchPublishedDepoimentos } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function MentorshipProgramPage() {
  let depoimentos: Awaited<ReturnType<typeof fetchPublishedDepoimentos>> = [];
  try {
    depoimentos = await fetchPublishedDepoimentos();
  } catch {
    depoimentos = [];
  }
  return <MentorshipProgramClient depoimentos={depoimentos} />;
}
