import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SupabaseProvider from '@/components/providers/SupabaseProvider';

export const metadata: Metadata = {
  title: 'Empathy Ledger',
  description: 'Community Stories, Community Ownership',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SupabaseProvider>
          <Header />
          <main style={{paddingTop: '72px'}}>{children}</main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}