import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const unitId = searchParams.get('unitId');
  if (!unitId) {
    return NextResponse.json({ error: 'unitId required' }, { status: 400 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { unitId },
    orderBy: { order: 'asc' },
    include: { _count: { select: { exercises: true } } },
  });

  return NextResponse.json(
    lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      order: l.order,
      xpReward: l.xpReward,
      type: l.type,
      unitId: l.unitId,
      exerciseCount: l._count.exercises,
    })),
  );
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { unitId, title, description, order, xpReward, type } = body;

    if (!unitId || typeof unitId !== 'string' || !unitId.trim()) {
      return NextResponse.json({ error: 'unitId required' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'title required' }, { status: 400 });
    }

    const maxOrder = await prisma.lesson
      .aggregate({
        where: { unitId: unitId.trim() },
        _max: { order: true },
      })
      .then((r) => r._max.order ?? 0);
    const orderNum = typeof order === 'number' && Number.isInteger(order) ? order : maxOrder + 1;
    const xp = typeof xpReward === 'number' && Number.isInteger(xpReward) && xpReward >= 0 ? xpReward : 10;
    const lessonType = typeof type === 'string' && ['lesson', 'practice', 'story'].includes(type) ? type : 'lesson';

    const lesson = await prisma.lesson.create({
      data: {
        unitId: unitId.trim(),
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        order: orderNum,
        xpReward: xp,
        type: lessonType,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Admin create lesson error', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 },
    );
  }
}
