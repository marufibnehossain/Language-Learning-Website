'use client';

import { useEffect, useState } from 'react';

export function StreakBadge() {
  const [streak, setStreak] = useState<number | null>(null);
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
        setStreak(typeof data.streak === 'number' ? data.streak : 0);
      } catch {
        setHasError(true);
      }

      setIsLoading(false);
    };

    fetchProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-warning/20 px-4 py-2 rounded-full">
        <span className="text-lg">🔥</span>
        <div className="w-8 h-4 rounded-full bg-warning/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-warning/20 px-4 py-2 rounded-full">
      <span className="text-lg">🔥</span>
      <span
        className="font-bold text-warning"
        title={hasError ? 'Unable to load streak' : undefined}
      >
        {hasError || streak === null ? '—' : streak}
      </span>
    </div>
  );
}
