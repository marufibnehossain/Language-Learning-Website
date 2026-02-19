import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');
  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
  }

  const exercises = await prisma.exercise.findMany({
    where: { lessonId },
  });

  return NextResponse.json(
    exercises.map((e) => ({
      id: e.id,
      type: e.type,
      prompt: e.prompt,
      question: e.question,
      optionsJson: e.optionsJson,
      answer: e.answer,
      explanation: e.explanation,
      lessonId: e.lessonId,
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
    const { lessonId, type, prompt, question, optionsJson, answer, explanation } = body;

    if (!lessonId || typeof lessonId !== 'string' || !lessonId.trim()) {
      return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
    }
    if (!type || typeof type !== 'string' || !['mcq', 'fill_blank', 'match_pairs'].includes(type)) {
      return NextResponse.json({ error: 'type must be mcq, fill_blank, or match_pairs' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question required' }, { status: 400 });
    }
    if (!answer || typeof answer !== 'string') {
      return NextResponse.json({ error: 'answer required' }, { status: 400 });
    }

    let optionsStr = '[]';
    if (optionsJson !== undefined) {
      if (typeof optionsJson === 'string') optionsStr = optionsJson;
      else if (Array.isArray(optionsJson)) optionsStr = JSON.stringify(optionsJson);
    }

    const exercise = await prisma.exercise.create({
      data: {
        lessonId: lessonId.trim(),
        type: type.trim(),
        prompt: prompt.trim(),
        question: question.trim(),
        optionsJson: optionsStr,
        answer: answer.trim(),
        explanation: typeof explanation === 'string' ? explanation.trim() || null : null,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Admin create exercise error', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 },
    );
  }
}
