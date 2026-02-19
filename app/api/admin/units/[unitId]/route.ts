import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { unitId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { unitId } = params;
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { id: true, title: true, courseId: true },
  });
  if (!unit) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
  }
  return NextResponse.json(unit);
}

export async function PATCH(
  req: Request,
  { params }: { params: { unitId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { unitId } = params;

  try {
    const body = await req.json();
    const { title, description, order } = body;

    const data: { title?: string; description?: string; order?: number } = {};
    if (typeof title === 'string' && title.trim()) data.title = title.trim();
    if (typeof description === 'string') data.description = description.trim();
    if (typeof order === 'number' && Number.isInteger(order)) data.order = order;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one field to update' },
        { status: 400 },
      );
    }

    const unit = await prisma.unit.update({
      where: { id: unitId },
      data,
    });

    return NextResponse.json(unit);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    console.error('Admin update unit error', error);
    return NextResponse.json(
      { error: 'Failed to update unit' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { unitId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { unitId } = params;

  try {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { lessons: true },
    });
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    const lessonIds = unit.lessons.map((l) => l.id);
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
    await prisma.lesson.deleteMany({ where: { unitId } });
    await prisma.unit.delete({ where: { id: unitId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    console.error('Admin delete unit error', error);
    return NextResponse.json(
      { error: 'Failed to delete unit' },
      { status: 500 },
    );
  }
}
