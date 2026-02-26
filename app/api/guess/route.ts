// app/api/guess/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processGuess, GuessInputSchema } from '../../../services/gameService';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedBody = GuessInputSchema.parse(body);

    const result = processGuess(validatedBody.word);

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
