'use client';

import { motion } from 'framer-motion';
import type { Lesson } from '@/lib/types';

interface LessonBubbleProps {
  lesson: Lesson;
  state: 'locked' | 'next' | 'completed' | 'practice' | 'story';
  onClick: () => void;
}

export function LessonBubble({ lesson, state, onClick }: LessonBubbleProps) {
  const isLocked = state === 'locked';
  const isNext = state === 'next';
  const isCompleted = state === 'completed';
  const isPractice = lesson.type === 'practice';

  const getBubbleStyles = () => {
    if (isLocked) {
      return 'bg-panel border-2 border-dashed border-muted text-muted cursor-not-allowed';
    }
    if (isNext) {
      return 'bg-primary text-white border-2 border-primary-strong shadow-lg cursor-pointer';
    }
    if (isCompleted) {
      return 'bg-primary-soft border-2 border-primary text-primary-strong cursor-pointer';
    }
    return 'bg-white border-2 border-border text-text cursor-pointer hover:border-primary';
  };

  const getIcon = () => {
    if (isPractice) return '🔄';
    if (isCompleted) return '✓';
    if (isLocked) return '🔒';
    return '→';
  };

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm transition-smooth ${getBubbleStyles()}`}
      aria-label={lesson.title}
    >
      {getIcon()}
    </motion.div>
  );
}
