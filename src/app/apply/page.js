import { redirect } from 'next/navigation';

export default function ApplyPage({ searchParams }) {
  const qs = new URLSearchParams(searchParams).toString();
  redirect(`/careers${qs ? `?${qs}` : ''}`);
}
