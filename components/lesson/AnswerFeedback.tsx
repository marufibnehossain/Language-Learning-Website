'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
}

export function AnswerFeedback({ isCorrect, correctAnswer, explanation }: AnswerFeedbackProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`mt-4 p-4 rounded-lg ${
          isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-danger/10 border-2 border-danger'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{isCorrect ? '✓' : '✗'}</span>
          <span className={`font-bold ${isCorrect ? 'text-green-800' : 'text-danger'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </span>
        </div>
        {!isCorrect && (
          <p className="text-sm text-text mb-1">
            Correct answer: <span className="font-semibold">{correctAnswer}</span>
          </p>
        )}
        {explanation && (
          <p className="text-sm text-muted mt-2">{explanation}</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
