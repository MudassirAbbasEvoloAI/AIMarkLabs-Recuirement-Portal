'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function PublicNavWrapper() {
  const path = usePathname();
  if (path.startsWith('/portal')) return null;
  return <Navbar />;
}
