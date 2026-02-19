'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ChoiceOptionProps {
  option: string;
  isCorrect: boolean;
  isSelected: boolean;
  onClick: () => void;
  showResult: boolean;
}

export function ChoiceOption({
  option,
  isCorrect,
  isSelected,
  onClick,
  showResult,
}: ChoiceOptionProps) {
  const getStyles = () => {
    if (!showResult) {
      return isSelected
        ? 'bg-primary text-white border-primary'
        : 'bg-white text-text border-border hover:border-primary hover:bg-panel';
    }
    
    if (isCorrect) {
      return 'bg-green-500 text-white border-green-600';
    }
    if (isSelected && !isCorrect) {
      return 'bg-danger text-white border-danger';
    }
    return 'bg-panel text-muted border-border opacity-60';
  };

  return (
    <motion.button
      whileHover={!showResult ? { scale: 1.02 } : {}}
      whileTap={!showResult ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={showResult}
      className={`w-full text-left p-4 rounded-lg border-2 transition-smooth font-medium ${getStyles()}`}
    >
      {option}
    </motion.button>
  );
}
