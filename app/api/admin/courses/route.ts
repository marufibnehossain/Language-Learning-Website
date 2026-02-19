import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      language: true,
      _count: { select: { units: true } },
    },
  });

  return NextResponse.json(
    courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      language: c.language,
      unitCount: c._count.units,
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
    const { title, description, language } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 },
      );
    }
    if (!language || typeof language !== 'string' || !language.trim()) {
      return NextResponse.json(
        { error: 'Language is required' },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        language: language.trim(),
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Admin create course error', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 },
    );
  }
}
