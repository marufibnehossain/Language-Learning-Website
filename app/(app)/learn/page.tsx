'use client';

import { useEffect, useState } from 'react';
import { PathMap } from '@/components/learn/PathMap';
import { getCourses, getCourseById, type CourseListItem } from '@/lib/data';
import type { Course } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function SpanishFlagIcon() {
  return (
    <svg
      aria-label="Spanish flag"
      className="mb-4 w-16 h-10 shadow-soft border border-border"
      viewBox="0 0 3 2"
    >
      <rect width="3" height="2" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
    </svg>
  );
}

function FrenchFlagIcon() {
  return (
    <svg
      aria-label="French flag"
      className="mb-4 w-16 h-10 shadow-soft border border-border"
      viewBox="0 0 3 2"
    >
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#FFF" />
      <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
  );
}

const LANGUAGE_TO_FLAG: Record<string, 'es' | 'fr'> = {
  Spanish: 'es',
  French: 'fr',
};

function LanguageFlag({ language }: { language: string }) {
  const code = LANGUAGE_TO_FLAG[language];
  if (code === 'es') return <SpanishFlagIcon />;
  if (code === 'fr') return <FrenchFlagIcon />;
  return (
    <div className="mb-4 w-16 h-10 rounded-lg shadow-soft border border-border flex items-center justify-center text-lg font-bold text-muted">
      {language.slice(0, 2).toUpperCase()}
    </div>
  );
}

const NATIVE_NAMES: Record<string, string> = {
  Spanish: 'Español',
  French: 'Français',
};

export default function LearnPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      const list = await getCourses();
      setCourses(list);
      setCoursesLoading(false);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    let cancelled = false;

    const fetchCourse = async () => {
      setLoadingCourse(true);
      const data = await getCourseById(selectedCourseId);
      if (!cancelled) {
        setCourse(data);
        setLoadingCourse(false);
      }
    };

    fetchCourse();

    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  const handleResetLanguage = () => {
    setSelectedCourseId(null);
    setCourse(null);
    setLoadingCourse(false);
  };

  if (!selectedCourseId) {
    return (
      <div className="min-h-screen bg-panel py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-text mb-2">Choose a language</h1>
          <p className="text-muted mb-8">
            Pick a language to start your guided learning path.
          </p>

          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse">
                  <div className="h-full rounded-lg bg-panel" />
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="text-muted">No courses available. Run the seed script.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourseId(c.id)}
                  className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-panel rounded-xl"
                >
                  <Card hover className="h-full flex flex-col items-center justify-between">
                    <LanguageFlag language={c.language} />
                    <div className="text-lg font-semibold text-text mb-1">{c.language}</div>
                    <div className="text-sm text-muted mb-2">{NATIVE_NAMES[c.language] ?? c.language}</div>
                    <p className="text-xs text-muted text-center">{c.description}</p>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-panel py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted">Loading learning path...</p>
          <Button
            variant="tertiary"
            size="sm"
            className="mt-4"
            onClick={handleResetLanguage}
          >
            Change language
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-panel py-8 flex flex-col items-center justify-center gap-4">
        <p className="text-muted">Course not found.</p>
        <Button variant="secondary" size="sm" onClick={handleResetLanguage}>
          Back to languages
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panel py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-text mb-1">Your Learning Path</h1>
            <p className="text-muted">
              Follow the path to master {course.language || 'this language'} step by step
            </p>
          </div>
          <Button variant="tertiary" size="sm" onClick={handleResetLanguage}>
            Change language
          </Button>
        </div>

        <PathMap course={course} />
      </div>
    </div>
  );
}
