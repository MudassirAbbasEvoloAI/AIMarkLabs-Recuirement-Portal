import './globals.css';
import PublicNavWrapper from '@/components/PublicNavWrapper';
import PageWrapper from '@/components/PageWrapper';

export const metadata = {
  title: 'AiMark Labs | Recruitment Services',
  description: 'Scale your team across the Middle East. Remote, Onsite, Any Role, Any Industry.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PublicNavWrapper />
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
