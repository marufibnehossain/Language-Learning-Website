import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    // Delete in order to satisfy foreign keys (SQLite)
    await prisma.attemptExercise.deleteMany({
      where: { attempt: { userId } },
    });
    await prisma.attempt.deleteMany({ where: { userId } });
    await prisma.creditTransaction.deleteMany({ where: { userId } });
    await prisma.emailVerificationToken.deleteMany({ where: { userId } });
    await prisma.wallet.deleteMany({ where: { userId } });
    await prisma.userProgress.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    console.error('Account delete error', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
