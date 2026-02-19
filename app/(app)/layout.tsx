'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status, data } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Trigger daily refill via API on first activity
      fetch('/api/wallet', { method: 'POST' }).catch(() => {
        // ignore errors for now
      });
    }
  }, [status, data, router]);

  return <AppShell>{children}</AppShell>;
}
