import { redirect } from 'next/navigation';

/** A página inicial da área autenticada é `/dashboard`. */
export default function RootPage() {
  redirect('/dashboard');
}
