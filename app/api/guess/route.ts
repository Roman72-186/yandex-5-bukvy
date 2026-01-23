// app/api/guess/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processGuess, GuessInputSchema } from '../../../services/gameService';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация тела запроса с помощью Zod
    const validatedBody = GuessInputSchema.parse(body);

    // Вызов сервисного слоя для обработки попытки
    const result = await processGuess(validatedBody.word);

    if (!result.isValid) {
      // Если слово недействительно или произошла ошибка, возвращаем 400
      return NextResponse.json(
        { error: result.error || 'Invalid guess' },
        { status: 400 }
      );
    }

    // Если попытка действительна, возвращаем результат
    // result.result содержит массив LetterResult
    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) { // Используем unknown для безопасности
    console.error('API Error processing guess:', error);

    // Проверяем, является ли ошибка ошибкой Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation failed: ${error.issues.map(issue => issue.message).join(', ')}` },
        { status: 400 }
      );
    }

    // Для любых других ошибок возвращаем 500
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}