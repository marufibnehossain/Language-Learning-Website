'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.push('/learn');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted">Loading...</p>
      </div>
    </div>
  );
}
