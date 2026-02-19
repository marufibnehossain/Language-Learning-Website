import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { spendCreditsForLessonForUser } from '@/lib/credits';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { lessonId } = await req.json();
  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });
  }

  const userId = (session.user as any).id as string;

  const result = await spendCreditsForLessonForUser(userId, lessonId);

  if (!result.success) {
    return NextResponse.json(
      { success: false, newBalance: result.newBalance, message: result.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    newBalance: result.newBalance,
  });
}

