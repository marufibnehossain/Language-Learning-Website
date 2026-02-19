import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: {
      lesson: true,
      exercises: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
    take: 5,
  });

  const mapped = attempts.map((a) => {
    const correctCount = a.exercises.filter((e) => e.isCorrect).length;
    const accuracy =
      a.exercises.length > 0 ? Math.round((correctCount / a.exercises.length) * 100) : 0;

    return {
      id: a.id,
      lessonTitle: a.lesson?.title ?? 'Unknown Lesson',
      xpEarned: a.xpEarned,
      accuracy,
      completedAt: a.completedAt ?? a.startedAt,
    };
  });

  return NextResponse.json(mapped);
}

