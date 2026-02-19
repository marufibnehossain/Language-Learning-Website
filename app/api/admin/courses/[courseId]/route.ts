import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { courseId } = params;

  try {
    const body = await req.json();
    const { title, description, language } = body;

    const data: { title?: string; description?: string; language?: string } = {};
    if (typeof title === 'string' && title.trim()) data.title = title.trim();
    if (typeof description === 'string') data.description = description.trim();
    if (typeof language === 'string' && language.trim()) data.language = language.trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one field to update' },
        { status: 400 },
      );
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data,
    });

    return NextResponse.json(course);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    console.error('Admin update course error', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { courseId } = params;

  try {
    // Delete in order (SQLite FK): attempts → exercises → lessons → units → course
    const units = await prisma.unit.findMany({
      where: { courseId },
      include: { lessons: true },
    });
    const lessonIds = units.flatMap((u) => u.lessons.map((l) => l.id));
    if (lessonIds.length > 0) {
      const attempts = await prisma.attempt.findMany({
        where: { lessonId: { in: lessonIds } },
        select: { id: true },
      });
      const attemptIds = attempts.map((a) => a.id);
      if (attemptIds.length > 0) {
        await prisma.attemptExercise.deleteMany({ where: { attemptId: { in: attemptIds } } });
      }
      await prisma.attempt.deleteMany({ where: { lessonId: { in: lessonIds } } });
      await prisma.exercise.deleteMany({ where: { lessonId: { in: lessonIds } } });
    }
    await prisma.lesson.deleteMany({ where: { unitId: { in: units.map((u) => u.id) } } });
    await prisma.unit.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    console.error('Admin delete course error', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 },
    );
  }
}
