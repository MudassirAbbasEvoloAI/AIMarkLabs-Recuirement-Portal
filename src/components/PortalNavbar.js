'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import s from './PortalNavbar.module.css';

const nav = [
  { href: '/portal/leads',        label: 'Leads' },
  { href: '/portal/applications', label: 'Applications' },
  { href: '/portal/positions',    label: 'Positions' },
  { href: '/portal/settings',     label: 'Settings' },
];

export default function PortalNavbar() {
  const path   = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setEmail(session.user.email);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/portal/login');
  };

  return (
    <nav className={s.nav}>
      <Link href="/portal/leads" className={s.logo}>
        <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 220 52" fill="none">
          <circle cx="22" cy="30" r="14" stroke="#fff" strokeWidth="5.5" fill="none"/>
          <circle cx="29" cy="10" r="5.5" fill="#f47a20"/>
          <text x="46" y="30" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="22" fill="#fff">Mark</text>
          <text x="46" y="49" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="18" fill="#f47a20">Labs</text>
        </svg>
        <span className={s.badge}>Portal</span>
      </Link>

      <div className={s.links}>
        {nav.map(n => (
          <Link key={n.href} href={n.href} className={`${s.link} ${path.startsWith(n.href) ? s.active : ''}`}>
            {n.label}
          </Link>
        ))}
      </div>

      <div className={s.user}>
        {email && <span className={s.email}>{email}</span>}
        <button className={s.logout} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
