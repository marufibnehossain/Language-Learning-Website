'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Lesson } from '@/lib/types';

interface StartLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
}

export function StartLessonModal({ isOpen, onClose, lesson }: StartLessonModalProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch('/api/wallet/spend-for-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Not enough credits to start this lesson.');
        setIsStarting(false);
        return;
      }

      router.push(`/lesson/${lesson.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsStarting(false);
    }
  };

  const handlePractice = () => {
    router.push(`/practice?lessonId=${lesson.id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lesson.title}>
      <div className="space-y-6">
        <p className="text-muted">{lesson.description}</p>

        <div className="flex items-center gap-4">
          <Badge variant="primary">+{lesson.xpReward} XP</Badge>
          <Badge variant="warning">Cost: 5 credits</Badge>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={handleStart}
            className="w-full"
            disabled={isStarting}
          >
            {isStarting ? 'Starting...' : 'Start (spend 5 credits)'}
          </Button>
          <Button variant="secondary" onClick={handlePractice} className="w-full">
            Practice instead (free)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
