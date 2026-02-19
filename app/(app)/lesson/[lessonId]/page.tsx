'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '@/lib/data';
import { LessonProgressTopBar } from '@/components/lesson/LessonProgressTopBar';
import { QuestionFrame } from '@/components/lesson/QuestionFrame';
import { ChoiceOption } from '@/components/lesson/ChoiceOption';
import { AnswerFeedback } from '@/components/lesson/AnswerFeedback';
import { Button } from '@/components/ui/Button';
import type { Lesson } from '@/lib/types';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [attemptAnswers, setAttemptAnswers] = useState<
    Array<{ exerciseId: string; userAnswer: string; isCorrect: boolean }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      const data = await getLessonById(lessonId);
      if (!data) {
        router.push('/learn');
        return;
      }
      setLesson(data);
      setLoading(false);
    };
    fetchLesson();
  }, [lessonId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel">
        <p className="text-muted">Lesson not found</p>
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === lesson.exercises.length - 1;

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect =
      selectedAnswer.toLowerCase().trim() === currentExercise.answer.toLowerCase().trim();
    setAttemptAnswers([
      ...attemptAnswers,
      {
        exerciseId: currentExercise.id,
        userAnswer: selectedAnswer,
        isCorrect,
      },
    ]);
    setShowFeedback(true);
  };

  const handleContinue = async () => {
    if (isLastExercise) {
      await finishLesson();
    } else {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    }
  };

  const finishLesson = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/attempts/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          exercises: attemptAnswers,
        }),
      });

      if (!res.ok) {
        setIsSubmitting(false);
        router.push('/results/error');
        return;
      }

      const data = await res.json();
      const attemptId = data.attemptId as string;

      router.push(`/results/${attemptId}`);
    } catch {
      setIsSubmitting(false);
      router.push('/results/error');
    }
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    if (currentExercise.type === 'mcq') {
      return (
        <div className="space-y-3">
          {currentExercise.options?.map((option, index) => (
            <ChoiceOption
              key={index}
              option={option}
              isCorrect={option === currentExercise.answer}
              isSelected={selectedAnswer === option}
              onClick={() => handleAnswerSelect(option)}
              showResult={showFeedback}
            />
          ))}
        </div>
      );
    }

    if (currentExercise.type === 'fill_blank') {
      return (
        <div className="space-y-4">
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => handleAnswerSelect(e.target.value)}
            disabled={showFeedback}
            className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg"
            placeholder="Type your answer..."
            autoFocus
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-panel">
      <LessonProgressTopBar
        currentStep={currentExerciseIndex + 1}
        totalSteps={lesson.exercises.length}
      />
      
      <div className="py-8">
        <QuestionFrame
          prompt={currentExercise.prompt}
          question={currentExercise.question}
        >
          {renderExercise()}

          {showFeedback && (
            <>
              <AnswerFeedback
                isCorrect={attemptAnswers[attemptAnswers.length - 1]?.isCorrect || false}
                correctAnswer={currentExercise.answer}
                explanation={currentExercise.explanation}
              />
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={handleContinue}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isLastExercise ? (isSubmitting ? 'Finishing...' : 'Finish Lesson') : 'Continue'}
                </Button>
              </div>
            </>
          )}

          {!showFeedback && selectedAnswer && (
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={handleSubmitAnswer}
                className="w-full"
              >
                Check Answer
              </Button>
            </div>
          )}
        </QuestionFrame>
      </div>
    </div>
  );
}
