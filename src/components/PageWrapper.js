'use client';
import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }) {
  const path = usePathname();
  return <div style={path.startsWith('/portal') ? {} : { paddingTop: 64 }}>{children}</div>;
}
