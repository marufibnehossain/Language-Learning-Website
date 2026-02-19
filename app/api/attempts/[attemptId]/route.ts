import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { attemptId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { attemptId } = params;

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      lesson: {
        include: {
          exercises: true,
        },
      },
      exercises: true,
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const mistakes = attempt.exercises.filter((e) => !e.isCorrect);

  return NextResponse.json({
    id: attempt.id,
    lessonId: attempt.lessonId,
    xpEarned: attempt.xpEarned,
    completedAt: attempt.completedAt,
    exercises: attempt.exercises,
    lesson: {
      id: attempt.lesson.id,
      title: attempt.lesson.title,
      description: attempt.lesson.description,
      xpReward: attempt.lesson.xpReward,
      exercises: attempt.lesson.exercises,
    },
    mistakesCount: mistakes.length,
  });
}

