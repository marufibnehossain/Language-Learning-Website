import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } },
) {
  const { courseId } = params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      units: {
        include: {
          lessons: {
            include: {
              exercises: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const transformed = {
    id: course.id,
    title: course.title,
    description: course.description,
    language: course.language,
    units: course.units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      description: unit.description,
      courseId: unit.courseId,
      order: unit.order,
      lessons: unit.lessons.map((lesson) => ({
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
      })),
    })),
  };

  return NextResponse.json(transformed);
}
