import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { exerciseId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { exerciseId } = params;

  try {
    const body = await req.json();
    const { type, prompt, question, optionsJson, answer, explanation } = body;

    const data: {
      type?: string;
      prompt?: string;
      question?: string;
      optionsJson?: string;
      answer?: string;
      explanation?: string | null;
    } = {};
    if (typeof type === 'string' && ['mcq', 'fill_blank', 'match_pairs'].includes(type)) data.type = type;
    if (typeof prompt === 'string') data.prompt = prompt.trim();
    if (typeof question === 'string') data.question = question.trim();
    if (optionsJson !== undefined) {
      if (typeof optionsJson === 'string') data.optionsJson = optionsJson;
      else if (Array.isArray(optionsJson)) data.optionsJson = JSON.stringify(optionsJson);
    }
    if (typeof answer === 'string') data.answer = answer.trim();
    if (explanation !== undefined) data.explanation = typeof explanation === 'string' ? explanation.trim() || null : null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one field to update' },
        { status: 400 },
      );
    }

    const exercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data,
    });

    return NextResponse.json(exercise);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }
    console.error('Admin update exercise error', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { exerciseId: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { exerciseId } = params;

  try {
    await prisma.attemptExercise.deleteMany({ where: { exerciseId } });
    await prisma.exercise.delete({ where: { id: exerciseId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }
    console.error('Admin delete exercise error', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 },
    );
  }
}
