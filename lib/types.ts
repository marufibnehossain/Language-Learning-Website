// Core data types for the language learning app

export type ExerciseType = 'mcq' | 'fill_blank' | 'match_pairs';

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  question: string;
  options?: string[]; // For MCQ
  answer: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  unitId: string;
  order: number;
  xpReward: number;
  exercises: Exercise[];
  type?: 'lesson' | 'practice' | 'story';
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  units: Unit[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  cap: number;
  lastRefillDate: string; // ISO date string
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // Can be negative (spent) or positive (earned)
  type: 'spent' | 'earned' | 'refill' | 'bonus';
  description: string;
  timestamp: string;
  lessonId?: string;
}

export interface Attempt {
  id: string;
  userId: string;
  lessonId: string;
  startedAt: string;
  completedAt?: string;
  exercises: {
    exerciseId: string;
    userAnswer: string;
    isCorrect: boolean;
  }[];
  xpEarned: number;
  creditsSpent: number;
}

export interface UserProgress {
  userId: string;
  xp: number;
  streak: number;
  lastActiveDate: string; // ISO date string
  completedLessons: string[]; // Lesson IDs
  dailyXpGoal: number;
}

export interface LessonBubbleState {
  lessonId: string;
  state: 'locked' | 'next' | 'completed' | 'practice' | 'story';
}
