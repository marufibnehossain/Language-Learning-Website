import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        wallet: {
          create: {
            balance: 50,
            cap: 100,
            lastRefillDate: new Date(),
          },
        },
        progress: {
          create: {
            xp: 0,
            streak: 0,
            lastActiveDate: new Date(),
            dailyXpGoal: 10,
            // Stored as JSON string per Prisma schema
            completedLessons: JSON.stringify([]),
          },
        },
      },
    });

    // For this MVP, we use a simple, stateless token: the user ID itself.
    // This avoids additional DB lookups while still letting us gate sign-in on verification.
    const token = user.id;

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        verificationToken: token,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

