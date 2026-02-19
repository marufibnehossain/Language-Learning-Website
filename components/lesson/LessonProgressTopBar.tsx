'use client';

import { ProgressBar } from '../ui/ProgressBar';

interface LessonProgressTopBarProps {
  currentStep: number;
  totalSteps: number;
}

export function LessonProgressTopBar({ currentStep, totalSteps }: LessonProgressTopBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white border-b border-border p-4 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted">
            Question {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
    </div>
  );
}
