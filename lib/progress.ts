// Progress tracking: XP, streaks, lesson completion (DB-backed via Prisma)

import { prisma } from './prisma';

const XP_PER_CORRECT = 10;
const XP_PER_LESSON_COMPLETION = 20;
const DAILY_XP_GOAL = 10;

type ProgressSnapshot = {
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyXpGoal: number;
  completedLessons: string[];
};

/**
 * Ensure a UserProgress row exists for the user
 */
export async function getOrCreateUserProgress(userId: string): Promise<ProgressSnapshot> {
  let row = await prisma.userProgress.findUnique({ where: { userId } });

  if (!row) {
    row = await prisma.userProgress.create({
      data: {
        userId,
        xp: 0,
        streak: 0,
        lastActiveDate: new Date(),
        dailyXpGoal: DAILY_XP_GOAL,
        completedLessons: JSON.stringify([]),
      },
    });
  }

  let completedLessons: string[] = [];
  try {
    completedLessons = JSON.parse(row.completedLessons || '[]');
  } catch {
    completedLessons = [];
  }

  return {
    xp: row.xp,
    streak: row.streak,
    lastActiveDate: row.lastActiveDate.toISOString(),
    dailyXpGoal: row.dailyXpGoal,
    completedLessons,
  };
}

/**
 * Update progress after completing a lesson attempt
 */
export async function updateProgressAfterAttempt(
  userId: string,
  lessonId: string,
  correctCount: number,
): Promise<{ xpGained: number; newStreak: number }> {
  const existing = await getOrCreateUserProgress(userId);

  const xpGained = correctCount * XP_PER_CORRECT + XP_PER_LESSON_COMPLETION;

  const today = new Date();
  const lastActive = new Date(existing.lastActiveDate);
  today.setHours(0, 0, 0, 0);
  lastActive.setHours(0, 0, 0, 0);

  let newStreak = existing.streak || 0;
  const daysDiff = Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysDiff === 0) {
    // Same day: if they complete a lesson, keep streak at least 1
    if (newStreak === 0) newStreak = 1;
  } else if (daysDiff === 1) {
    newStreak = (existing.streak || 0) + 1;
  } else {
    newStreak = 1;
  }

  const completedLessons = new Set(existing.completedLessons);
  completedLessons.add(lessonId);

  const updated = await prisma.userProgress.update({
    where: { userId },
    data: {
      xp: existing.xp + xpGained,
      streak: newStreak,
      lastActiveDate: new Date(),
      completedLessons: JSON.stringify(Array.from(completedLessons)),
    },
  });

  return {
    xpGained,
    newStreak: updated.streak,
  };
}

/**
 * Get current progress snapshot
 */
export async function getCurrentProgress(userId: string): Promise<ProgressSnapshot> {
  return getOrCreateUserProgress(userId);
}

/**
 * Get streak progress indicator (XP needed to maintain streak)
 */
export async function getStreakProgress(userId: string): Promise<{
  current: number;
  goal: number;
  remaining: number;
}> {
  const progress = await getOrCreateUserProgress(userId);
  // For now, treat goal as fixed per-day target
  return {
    current: progress.dailyXpGoal,
    goal: progress.dailyXpGoal,
    remaining: 0,
  };
}
