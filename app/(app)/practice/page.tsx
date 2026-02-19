'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Exercise } from '@/lib/types';

export default function PracticePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [practiceMode, setPracticeMode] = useState<'menu' | 'mistakes' | 'match'>('menu');
  const [mistakes, setMistakes] = useState<Array<{ exercise: Exercise; userAnswer: string }>>([]);
  const [matchPairs, setMatchPairs] = useState<
    Array<{ word: string; translation: string; id: string }>
  >([]);
  const [selectedPairs, setSelectedPairs] = useState<Array<string>>([]);
  const [matchedPairs, setMatchedPairs] = useState<Array<string>>([]);

  useEffect(() => {
    const mistakesParam = searchParams.get('mistakes');
    if (mistakesParam) {
      loadMistakes(mistakesParam);
    }
  }, [searchParams]);

  const loadMistakes = async (attemptId: string) => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      if (!res.ok) return;
      const data = await res.json();

      const mistakeExercises = data.exercises
        .filter((e: any) => !e.isCorrect)
        .map((e: any) => {
          const exercise = data.lesson.exercises.find(
            (ex: any) => ex.id === e.exerciseId,
          ) as Exercise | undefined;
          return exercise ? { exercise, userAnswer: e.userAnswer as string } : null;
        })
        .filter(
          (e: { exercise: Exercise; userAnswer: string } | null): e is {
            exercise: Exercise;
            userAnswer: string;
          } => e !== null,
        );

      setMistakes(mistakeExercises);
      setPracticeMode('mistakes');
    } catch {
      // ignore
    }
  };

  const startMistakesReview = async () => {
    try {
      const res = await fetch('/api/attempts/recent');
      if (!res.ok) return;
      const recent = await res.json();
      if (recent.length > 0) {
        await loadMistakes(recent[0].id);
      }
    } catch {
      // ignore
    }
  };

  const startVocabularyMatch = () => {
    // Simple vocabulary pairs for matching game
    const pairs = [
      { word: 'Hola', translation: 'Hello', id: '1' },
      { word: 'Adiós', translation: 'Goodbye', id: '2' },
      { word: 'Gracias', translation: 'Thank you', id: '3' },
      { word: 'Por favor', translation: 'Please', id: '4' },
      { word: 'Buenos días', translation: 'Good morning', id: '5' },
      { word: 'Buenas noches', translation: 'Good night', id: '6' },
    ];
    
    // Shuffle
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    setMatchPairs(shuffled);
    setPracticeMode('match');
    setSelectedPairs([]);
    setMatchedPairs([]);
  };

  const handleMatchClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    
    if (selectedPairs.length === 0) {
      setSelectedPairs([id]);
    } else if (selectedPairs.length === 1) {
      const firstId = selectedPairs[0];
      const firstPair = matchPairs.find((p) => p.id === firstId);
      const secondPair = matchPairs.find((p) => p.id === id);
      
      if (firstPair && secondPair) {
        // Check if they match (word-translation or translation-word)
        const isMatch =
          (firstPair.word === secondPair.translation) ||
          (firstPair.translation === secondPair.word);
        
        if (isMatch) {
          setMatchedPairs([...matchedPairs, firstId, id]);
        }
        setSelectedPairs([]);
      }
    }
  };

  if (practiceMode === 'mistakes') {
    return (
      <div className="min-h-screen bg-panel py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <h1 className="text-2xl font-bold text-text mb-4">Mistakes Review</h1>
            <div className="space-y-4">
              {mistakes.map((mistake, index) => (
                <div key={index} className="bg-panel p-4 rounded-lg">
                  <p className="font-medium text-text mb-2">{mistake.exercise.question}</p>
                  <p className="text-sm text-danger">Your answer: {mistake.userAnswer}</p>
                  <p className="text-sm text-green-600 font-semibold">
                    Correct: {mistake.exercise.answer}
                  </p>
                  {mistake.exercise.explanation && (
                    <p className="text-sm text-muted mt-2">{mistake.exercise.explanation}</p>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              onClick={() => setPracticeMode('menu')}
              className="w-full mt-6"
            >
              Back to Practice Hub
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (practiceMode === 'match') {
    const allItems = [
      ...matchPairs.map((p) => ({ text: p.word, id: p.id, type: 'word' })),
      ...matchPairs.map((p) => ({ text: p.translation, id: p.id, type: 'translation' })),
    ].sort(() => Math.random() - 0.5);

    return (
      <div className="min-h-screen bg-panel py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <h1 className="text-2xl font-bold text-text mb-4">Vocabulary Match</h1>
            <p className="text-muted mb-6">Match Spanish words with their English translations</p>
            <div className="grid grid-cols-2 gap-3">
              {allItems.map((item, index) => {
                const isSelected = selectedPairs.includes(item.id);
                const isMatched = matchedPairs.includes(item.id);
                return (
                  <button
                    key={index}
                    onClick={() => handleMatchClick(item.id)}
                    disabled={isMatched}
                    className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                      isMatched
                        ? 'bg-green-500 text-white border-green-600'
                        : isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-border hover:border-primary'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
            {matchedPairs.length === matchPairs.length * 2 && (
              <div className="mt-6 text-center">
                <p className="text-2xl mb-4">🎉 All matched!</p>
                <Button variant="primary" onClick={() => setPracticeMode('menu')} className="w-full">
                  Play Again
                </Button>
              </div>
            )}
            <Button
              variant="secondary"
              onClick={() => setPracticeMode('menu')}
              className="w-full mt-6"
            >
              Back to Practice Hub
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panel py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-text mb-2">Practice Hub</h1>
        <p className="text-muted mb-8">Free practice modes - no credits required!</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card hover>
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-text mb-2">Mistakes Review</h2>
            <p className="text-muted mb-4">
              Review your mistakes from previous lessons
            </p>
            <Button variant="primary" className="w-full" onClick={startMistakesReview}>
              Start Review
            </Button>
          </Card>

          <Card hover>
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-text mb-2">Vocabulary Match</h2>
            <p className="text-muted mb-4">
              Match Spanish words with their translations
            </p>
            <Button variant="primary" className="w-full" onClick={startVocabularyMatch}>
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
