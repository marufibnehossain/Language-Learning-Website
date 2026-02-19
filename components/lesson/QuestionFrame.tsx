'use client';

import { ReactNode } from 'react';

interface QuestionFrameProps {
  children: ReactNode;
  prompt: string;
  question: string;
}

export function QuestionFrame({ children, prompt, question }: QuestionFrameProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-border p-8 shadow-soft">
        <p className="text-muted text-sm mb-4">{prompt}</p>
        <h2 className="text-2xl font-bold text-text mb-8">{question}</h2>
        {children}
      </div>
    </div>
  );
}
