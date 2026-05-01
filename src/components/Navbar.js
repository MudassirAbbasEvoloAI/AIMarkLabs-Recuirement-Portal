'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const path = usePathname();
  const nav = [
    { href: '/',        label: 'Home' },
    { href: '/careers', label: 'Careers' },
  ];

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 220 52" fill="none">
          <circle cx="22" cy="30" r="14" stroke="#13193a" strokeWidth="5.5" fill="none"/>
          <circle cx="29" cy="10" r="5.5" fill="#f47a20"/>
          <text x="46" y="30" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="22" fill="#13193a">Mark</text>
          <text x="46" y="49" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="18" fill="#f47a20">Labs</text>
        </svg>
      </Link>

      <div className={styles.links}>
        {nav.map(n => (
          <Link key={n.href} href={n.href} className={`${styles.link} ${path === n.href ? styles.active : ''}`}>
            {n.label}
          </Link>
        ))}
        <Link href="/careers" className={styles.cta}>Hire Now →</Link>
      </div>
    </nav>
  );
}
