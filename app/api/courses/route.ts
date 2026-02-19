import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/courses – list all courses (for language grid) */
export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      language: true,
    },
  });

  return NextResponse.json(courses);
}
