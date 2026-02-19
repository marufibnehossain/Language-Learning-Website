import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { lessonId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { lessonId } = params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, title: true, unitId: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }
  return NextResponse.json(lesson);
}

export async function PATCH(
  req: Request,
  { params }: { params: { lessonId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { lessonId } = params;

  try {
    const body = await req.json();
    const { title, description, order, xpReward, type } = body;

    const data: {
      title?: string;
      description?: string;
      order?: number;
      xpReward?: number;
      type?: string;
    } = {};
    if (typeof title === 'string' && title.trim()) data.title = title.trim();
    if (typeof description === 'string') data.description = description.trim();
    if (typeof order === 'number' && Number.isInteger(order)) data.order = order;
    if (typeof xpReward === 'number' && Number.isInteger(xpReward) && xpReward >= 0) data.xpReward = xpReward;
    if (typeof type === 'string' && ['lesson', 'practice', 'story'].includes(type)) data.type = type;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one field to update' },
        { status: 400 },
      );
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    return NextResponse.json(lesson);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    console.error('Admin update lesson error', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { lessonId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { lessonId } = params;

  try {
    const attempts = await prisma.attempt.findMany({
      where: { lessonId },
      select: { id: true },
    });
    const attemptIds = attempts.map((a) => a.id);
    if (attemptIds.length > 0) {
      await prisma.attemptExercise.deleteMany({ where: { attemptId: { in: attemptIds } } });
    }
    await prisma.attempt.deleteMany({ where: { lessonId } });
    await prisma.exercise.deleteMany({ where: { lessonId } });
    await prisma.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    console.error('Admin delete lesson error', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 },
    );
  }
}
