import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { lessonId: string } },
) {
  const { lessonId } = params;

  // Find the current lesson
  const currentLesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: {
        include: {
          course: {
            include: {
              units: {
                include: {
                  lessons: {
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
          },
        },
      },
    },
  });

  if (!currentLesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const allUnits = currentLesson.unit.course.units;
  const currentUnit = allUnits.find((u) => u.id === currentLesson.unitId);
  if (!currentUnit) {
    return NextResponse.json({ nextLessonId: null });
  }

  const currentIndex = currentUnit.lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) {
    return NextResponse.json({ nextLessonId: null });
  }

  // Check if there's a next lesson in this unit
  if (currentIndex < currentUnit.lessons.length - 1) {
    return NextResponse.json({ nextLessonId: currentUnit.lessons[currentIndex + 1].id });
  }

  // Check if there's a next unit
  const unitIndex = allUnits.findIndex((u) => u.id === currentUnit.id);
  if (unitIndex < allUnits.length - 1) {
    const nextUnit = allUnits[unitIndex + 1];
    const firstLesson = nextUnit.lessons[0];
    return NextResponse.json({ nextLessonId: firstLesson?.id || null });
  }

  return NextResponse.json({ nextLessonId: null });
}
