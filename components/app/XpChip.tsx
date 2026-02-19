'use client';

import { useEffect, useState } from 'react';

export function XpChip() {
  const [xp, setXp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setHasError(false);
        const res = await fetch('/api/progress');
        if (!res.ok) {
          setHasError(true);
          return;
        }
        const data = await res.json();
        setXp(typeof data.xp === 'number' ? data.xp : 0);
      } catch {
        setHasError(true);
      }

      setIsLoading(false);
    };

    fetchProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-info/20 px-4 py-2 rounded-full">
        <span className="text-lg">⭐</span>
        <div className="w-12 h-4 rounded-full bg-info/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-info/20 px-4 py-2 rounded-full">
      <span className="text-lg">⭐</span>
      <span
        className="font-bold text-info"
        title={hasError ? 'Unable to load XP' : undefined}
      >
        {hasError || xp === null ? '—' : xp} XP
      </span>
    </div>
  );
}
