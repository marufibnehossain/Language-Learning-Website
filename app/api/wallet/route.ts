import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { applyDailyRefillForUser, getWalletSnapshot } from '@/lib/credits';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const snapshot = await getWalletSnapshot(userId);
  return NextResponse.json(snapshot);
}

export async function POST() {
  // Apply daily refill explicitly if needed
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const result = await applyDailyRefillForUser(userId);

  return NextResponse.json(result);
}

