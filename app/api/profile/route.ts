import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as { id?: string }).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name ?? '',
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { name } = body;

    if (typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name must be a string' },
        { status: 400 },
      );
    }

    const trimmed = name.trim();
    if (trimmed.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 100 characters or less' },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: trimmed || null },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile update error', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
