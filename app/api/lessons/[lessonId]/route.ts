import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { lessonId: string } },
) {
  const { lessonId } = params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      exercises: {
        orderBy: {
          id: 'asc',
        },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Transform to match frontend Lesson type
  const transformed = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    unitId: lesson.unitId,
    order: lesson.order,
    xpReward: lesson.xpReward,
    type: lesson.type as 'lesson' | 'practice' | 'story',
    exercises: lesson.exercises.map((ex) => {
      let options: string[] = [];
      try {
        options = JSON.parse(ex.optionsJson || '[]');
      } catch {
        options = [];
      }
      return {
        id: ex.id,
        type: ex.type as 'mcq' | 'fill_blank' | 'match_pairs',
        prompt: ex.prompt,
        question: ex.question,
        options: ex.type === 'mcq' ? options : undefined,
        answer: ex.answer,
        explanation: ex.explanation || undefined,
      };
    }),
  };

  return NextResponse.json(transformed);
}
