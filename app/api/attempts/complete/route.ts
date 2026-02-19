import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { updateProgressAfterAttempt } from '@/lib/progress';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { lessonId, exercises } = await req.json();

  if (!lessonId || !Array.isArray(exercises)) {
    return NextResponse.json({ error: 'Missing lessonId or exercises' }, { status: 400 });
  }

  const correctCount = exercises.filter((e: any) => e.isCorrect).length;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const xpEarned = correctCount * 10 + 20;

  const attempt = await prisma.attempt.create({
    data: {
      userId,
      lessonId,
      xpEarned,
      creditsSpent: 5,
      exercises: {
        create: exercises.map((e: any) => ({
          exerciseId: e.exerciseId,
          userAnswer: e.userAnswer,
          isCorrect: e.isCorrect,
        })),
      },
    },
  });

  const progressUpdate = await updateProgressAfterAttempt(userId, lessonId, correctCount);

  return NextResponse.json({
    attemptId: attempt.id,
    xpEarned,
    newStreak: progressUpdate.newStreak,
  });
}

