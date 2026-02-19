'use client';

import { useEffect, useState } from 'react';

export function CreditPill() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refreshBalance = async () => {
    try {
      setHasError(false);
      const res = await fetch('/api/wallet');
      if (!res.ok) {
        setHasError(true);
        return;
      }
      const data = await res.json();
      setBalance(typeof data.balance === 'number' ? data.balance : 0);
    } catch {
      setHasError(true);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    refreshBalance();
    // Also refresh on window focus
    const handleFocus = () => {
      refreshBalance();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-primary-soft px-4 py-2 rounded-full">
        <span className="text-lg">💎</span>
        <div className="w-8 h-4 rounded-full bg-primary/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-primary-soft px-4 py-2 rounded-full">
      <span className="text-lg">💎</span>
      <span
        className="font-bold text-primary-strong"
        title={hasError ? 'Unable to load credits' : undefined}
      >
        {hasError || balance === null ? '—' : balance}
      </span>
    </div>
  );
}
