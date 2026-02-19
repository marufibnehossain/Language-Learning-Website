'use client';

import { UnitHeader } from './UnitHeader';
import { LessonBubble } from './LessonBubble';
import { StartLessonModal } from './StartLessonModal';
import { OutOfCreditsModal } from './OutOfCreditsModal';
import { useState, useEffect } from 'react';
import type { Course, Lesson } from '@/lib/types';

interface PathMapProps {
  course: Course;
}

export function PathMap({ course }: PathMapProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showOutOfCreditsModal, setShowOutOfCreditsModal] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/progress');
        if (!res.ok) return;
        const data = await res.json();
        setCompletedLessons(data.completedLessons || []);
      } catch {
        // ignore
      }
    };
    fetchProgress();
  }, []);

  const getLessonState = (lesson: Lesson, index: number, unitIndex: number): 'locked' | 'next' | 'completed' | 'practice' | 'story' => {
    if (lesson.type === 'practice') return 'practice';
    if (lesson.type === 'story') return 'story';
    if (completedLessons.includes(lesson.id)) return 'completed';
    
    // First lesson is always next
    if (unitIndex === 0 && index === 0) return 'next';
    
    // Check if previous lesson is completed
    if (index > 0) {
      const prevLesson = course.units[unitIndex].lessons[index - 1];
      if (completedLessons.includes(prevLesson.id)) return 'next';
    }
    
    // Check if previous unit's last lesson is completed
    if (unitIndex > 0 && index === 0) {
      const prevUnit = course.units[unitIndex - 1];
      const lastLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
      if (completedLessons.includes(lastLesson.id)) return 'next';
    }
    
    return 'locked';
  };

  const handleBubbleClick = async (lesson: Lesson, lessonIndex: number, unitIndex: number) => {
    const state = getLessonState(lesson, lessonIndex, unitIndex);
    if (state === 'locked') return;

    setSelectedLesson(lesson);

    try {
      const res = await fetch('/api/wallet');
      if (!res.ok) {
        setShowOutOfCreditsModal(true);
        return;
      }
      const data = await res.json();
      const balance = data.balance ?? 0;
      if (balance >= 5) {
        setShowStartModal(true);
      } else {
        setShowOutOfCreditsModal(true);
      }
    } catch {
      setShowOutOfCreditsModal(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {course.units.map((unit, unitIndex) => (
        <div key={unit.id} className="mb-12">
          <UnitHeader unit={unit} />
          <div className="flex items-center gap-4 flex-wrap">
            {unit.lessons.map((lesson, lessonIndex) => {
              const state = getLessonState(lesson, lessonIndex, unitIndex);
              return (
                <div key={lesson.id} className="flex items-center gap-4">
                  <LessonBubble
                    lesson={lesson}
                    state={state}
                    onClick={() => handleBubbleClick(lesson, lessonIndex, unitIndex)}
                  />
                  {lessonIndex < unit.lessons.length - 1 && (
                    <div className="w-8 h-1 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedLesson && (
        <>
          <StartLessonModal
            isOpen={showStartModal}
            onClose={() => {
              setShowStartModal(false);
              setSelectedLesson(null);
            }}
            lesson={selectedLesson}
          />
          <OutOfCreditsModal
            isOpen={showOutOfCreditsModal}
            onClose={() => {
              setShowOutOfCreditsModal(false);
              setSelectedLesson(null);
            }}
          />
        </>
      )}
    </div>
  );
}
