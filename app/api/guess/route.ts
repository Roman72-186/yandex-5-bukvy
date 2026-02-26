// app/api/guess/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processGuess } from '../../../services/gameService';
import { z } from 'zod';

const RequestSchema = z.object({
  word: z.string().min(5).max(5).regex(/^[а-яА-ЯёЁa-zA-Z]+$/),
  target: z.string().min(5).max(5),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, target } = RequestSchema.parse(body);

    const result = processGuess(word, target);

    if (!result.isValid) {
      return NextResponse.json(
        { error: result.error || 'Invalid guess' },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    console.error('API Error processing guess:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation failed: ${error.issues.map(issue => issue.message).join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
