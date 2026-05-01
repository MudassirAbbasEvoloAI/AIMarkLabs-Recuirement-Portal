'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PortalNavbar from '@/components/PortalNavbar';

export default function PortalLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const isLogin  = pathname === '/portal/login';
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isLogin) router.replace('/portal/login');
      setChecking(false);
    });
  }, [isLogin, router]);

  if (checking) return null;

  if (isLogin) return <>{children}</>;

  return (
    <>
      <PortalNavbar />
      <div style={{ paddingTop: 64 }}>{children}</div>
    </>
  );
}
