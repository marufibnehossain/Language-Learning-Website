'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AttemptExerciseDto {
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface ResultsData {
  id: string;
  lessonId: string;
  xpEarned: number;
  completedAt: string;
  exercises: AttemptExerciseDto[];
  lesson: {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    exercises: {
      id: string;
      question: string;
      answer: string;
      explanation: string | null;
    }[];
  };
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [data, setData] = useState<ResultsData | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attemptRes, progressRes] = await Promise.all([
          fetch(`/api/attempts/${attemptId}`),
          fetch('/api/progress'),
        ]);

        if (!attemptRes.ok) {
          router.push('/learn');
          return;
        }

        const attemptData = await attemptRes.json();
        setData(attemptData);

        if (progressRes.ok) {
          const progress = await progressRes.json();
          setStreak(progress.streak ?? null);
        }
      } catch {
        router.push('/learn');
      }
    };

    fetchData();
  }, [attemptId, router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading results...</p>
      </div>
    );
  }

  const mistakes = data.exercises.filter((e) => !e.isCorrect);
  const correctCount = data.exercises.filter((e) => e.isCorrect).length;
  const accuracy =
    data.exercises.length > 0
      ? Math.round((correctCount / data.exercises.length) * 100)
      : 0;

  const handleContinue = () => {
    // For now, just go back to learn path
    router.push('/learn');
  };

  const handlePracticeMistakes = () => {
    router.push(`/practice?mistakes=${attemptId}`);
  };

  return (
    <div className="min-h-screen bg-panel py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center mb-6">
          <h1 className="text-4xl font-bold text-text mb-4">Lesson Complete! 🎉</h1>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="primary" className="text-lg px-4 py-2">
              +{data.xpEarned} XP
            </Badge>
            {streak !== null && (
              <Badge variant="warning" className="text-lg px-4 py-2">
                🔥 {streak} day streak
              </Badge>
            )}
          </div>

          <div className="bg-panel p-4 rounded-lg mb-6">
            <p className="text-2xl font-bold text-text mb-1">{accuracy}%</p>
            <p className="text-muted">Accuracy</p>
            <p className="text-sm text-muted mt-2">
              {correctCount} out of {data.exercises.length} correct
            </p>
          </div>
        </Card>

        {mistakes.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-text mb-4">Mistakes to Review</h2>
            <div className="space-y-2">
              {mistakes.map((mistake, index) => {
                const exercise = data.lesson.exercises.find(
                  (e) => e.id === mistake.exerciseId,
                );
                return (
                  <div
                    key={index}
                    className="bg-danger/10 border border-danger/30 rounded-lg p-3"
                  >
                    <p className="font-medium text-text">{exercise?.question}</p>
                    <p className="text-sm text-muted">
                      Your answer: <span className="text-danger">{mistake.userAnswer}</span>
                    </p>
                    <p className="text-sm text-muted">
                      Correct:{' '}
                      <span className="text-green-600 font-semibold">
                        {exercise?.answer}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <Button variant="primary" onClick={handleContinue} className="w-full">
            Back to Path
          </Button>
          {mistakes.length > 0 && (
            <Button variant="secondary" onClick={handlePracticeMistakes} className="w-full">
              Practice Weak Items
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
