import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // In this simplified flow, the token is the user ID.
    const user = await prisma.user.findUnique({
      where: { id: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify email error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

