import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 });
  }

  const units = await prisma.unit.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: { _count: { select: { lessons: true } } },
  });

  return NextResponse.json(
    units.map((u) => ({
      id: u.id,
      title: u.title,
      description: u.description,
      order: u.order,
      courseId: u.courseId,
      lessonCount: u._count.lessons,
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
    const { courseId, title, description, order } = body;

    if (!courseId || typeof courseId !== 'string' || !courseId.trim()) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'title required' }, { status: 400 });
    }

    const maxOrder = await prisma.unit
      .aggregate({
        where: { courseId: courseId.trim() },
        _max: { order: true },
      })
      .then((r) => r._max.order ?? 0);
    const orderNum = typeof order === 'number' && Number.isInteger(order) ? order : maxOrder + 1;

    const unit = await prisma.unit.create({
      data: {
        courseId: courseId.trim(),
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        order: orderNum,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error('Admin create unit error', error);
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 },
    );
  }
}
