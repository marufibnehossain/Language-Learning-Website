'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full h-3 bg-panel rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full bg-primary rounded-full"
      />
    </div>
  );
}
