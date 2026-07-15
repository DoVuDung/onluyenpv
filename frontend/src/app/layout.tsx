import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { AiCoachDrawer } from '@/components/AiCoachDrawer';

export const metadata: Metadata = {
  title: 'OnLuyenPV — Frontend Interview Platform (2,000+ Questions & AI Coach)',
  description: 'Master Frontend Engineering interviews with 2,000+ interactive questions, live CQRS contests, and real-time AI Coaching with SM-2 spaced repetition.',
  openGraph: {
    title: 'OnLuyenPV — Frontend Interview Platform',
    description: 'High-performance interview preparation platform tailored for Frontend Engineers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 71px)', paddingBottom: '60px' }}>
            {children}
          </main>
          <AiCoachDrawer />
        </Providers>
      </body>
    </html>
  );
}
